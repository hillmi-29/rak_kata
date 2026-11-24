import { prisma } from '../config/database';
import { couponService } from './couponService';
import { shippingService } from './shippingService';
import { xenditService } from './xenditService';
import { emailService } from './emailService';

export interface CheckoutInput {
  userId: string;
  addressId?: string;
  shippingAddress?: {
    recipient: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    cityId?: string;
    provinceId?: string;
  };
  courier?: string;
  couponCode?: string;
  notes?: string;
}

export const orderService = {
  async checkout(input: CheckoutInput) {
    const { userId, addressId, notes, couponCode, courier } = input;

    // 1. Fetch Cart with Items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { book: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      const err: any = new Error('Keranjang belanja masih kosong');
      err.statusCode = 400;
      err.code = 'CART_EMPTY';
      throw err;
    }

    // 2. Get user for email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      const err: any = new Error('Pengguna tidak ditemukan');
      err.statusCode = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }

    // 3. Resolve Shipping Address
    let shippingAddress = input.shippingAddress;
    if (addressId) {
      const addr = await prisma.address.findFirst({
        where: { id: addressId, userId },
      });
      if (addr) {
        shippingAddress = {
          recipient: addr.recipient,
          phone: addr.phone,
          address: addr.address,
          city: addr.city,
          province: addr.province,
          postalCode: addr.postalCode,
          cityId: addr.cityId ?? undefined,
          provinceId: addr.provinceId ?? undefined,
        };
      }
    }

    if (!shippingAddress) {
      const err: any = new Error('Alamat pengiriman wajib ditentukan');
      err.statusCode = 400;
      err.code = 'ADDRESS_REQUIRED';
      throw err;
    }

    // 4. Check stock & calculate subtotal & total weight
    let subtotal = 0;
    let totalWeight = 0;

    for (const item of cart.items) {
      if (item.book.stock < item.qty) {
        const err: any = new Error(
          `Stok buku "${item.book.title}" tidak mencukupi (sisa ${item.book.stock})`
        );
        err.statusCode = 400;
        err.code = 'INSUFFICIENT_STOCK';
        throw err;
      }
      subtotal += item.book.price * item.qty;
      totalWeight += item.book.weight * item.qty;
    }

    // 5. Calculate Shipping Cost using RajaOngkir
    let shippingCost = 0;
    let selectedCourier = courier || 'jne';
    let estimatedDays = '3-5 hari';

    if (shippingAddress.cityId) {
      const origin = { cityId: process.env.SHOP_CITY_ID || '152' }; // Default to Jakarta
      const destination = { cityId: shippingAddress.cityId };

      try {
        const rates = await shippingService.calculateShipping(
          origin,
          destination,
          totalWeight,
          selectedCourier.toLowerCase()
        );

        if (rates.length > 0) {
          shippingCost = rates[0].cost;
          estimatedDays = rates[0].estimatedDays;
        }
      } catch (e) {
        console.error('Shipping calculation failed, using fallback:', e);
      }
    }

    // Fallback if no shipping cost calculated
    if (shippingCost === 0) {
      const weightInKg = Math.ceil(totalWeight / 1000) || 1;
      shippingCost = weightInKg * 15000;
    }

    // 6. Handle Coupon / Discount
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const validation = await couponService.validateCoupon(couponCode, userId, subtotal);
      if (validation.valid && validation.discount !== undefined) {
        discount = validation.discount;
        appliedCoupon = validation.coupon!;
      }
    }

    const total = Math.max(0, subtotal + shippingCost - discount);

    // 7. Generate Unique Order Number: ORD-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randomSuffix}`;

    // 8. Atomic Transaction: create Order, OrderItems, decrement Book stock, record coupon usage, clear cart
    const order = await prisma.$transaction(async tx => {
      // Decrease stock
      for (const item of cart.items) {
        await tx.book.update({
          where: { id: item.bookId },
          data: { stock: { decrement: item.qty } },
        });
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'PENDING',
          subtotal,
          shippingCost,
          discount,
          total,
          shippingAddress: shippingAddress as any,
          notes,
          items: {
            create: cart.items.map(item => ({
              bookId: item.bookId,
              qty: item.qty,
              price: item.book.price,
              bookTitle: item.book.title,
              bookCover: item.book.coverImage || '',
            })),
          },
        },
        include: { items: true },
      });

      // Update coupon usage if applied
      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usedCount: { increment: 1 } },
        });

        await tx.couponUsage.create({
          data: {
            couponId: appliedCoupon.id,
            userId,
            orderId: newOrder.id,
          },
        });
      }

      // Empty cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    // 9. Create Xendit Invoice
    let paymentResult = null;
    try {
      const items = cart.items.map(item => ({
        name: item.book.title,
        quantity: item.qty,
        price: item.book.price,
        category: 'Book',
      }));

      paymentResult = await xenditService.createInvoice({
        externalId: order.orderNumber,
        amount: total,
        payerEmail: user.email,
        description: `Pembayaran pesanan ${orderNumber}`,
        items,
      });

      // Save payment record
      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: 'xendit',
          providerRef: paymentResult.id,
          status: 'PENDING',
          amount: total,
          currency: 'IDR',
          invoiceUrl: paymentResult.invoiceUrl,
        },
      });
    } catch (e) {
      console.error('Xendit invoice creation failed:', e);
      // Continue without payment - user can retry from order detail
    }

    // 10. Send order confirmation email
    try {
      await emailService.sendOrderConfirmation(user.email, order.orderNumber, total);
    } catch (e) {
      console.error('Order confirmation email failed:', e);
    }

    return {
      order,
      payment: paymentResult
        ? {
            invoiceUrl: paymentResult.invoiceUrl,
            invoiceId: paymentResult.id,
            expiresAt: paymentResult.expiredAt
              ? new Date(paymentResult.expiredAt)
              : new Date(Date.now() + 24 * 60 * 60 * 1000),
          }
        : null,
      shippingInfo: {
        cost: shippingCost,
        courier: selectedCourier,
        estimatedDays,
        weight: totalWeight,
      },
    };
  },

  async getUserOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getOrderDetail(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      const err: any = new Error('Pesanan tidak ditemukan');
      err.statusCode = 404;
      err.code = 'ORDER_NOT_FOUND';
      throw err;
    }

    return order;
  },

  async cancelOrder(userId: string, orderId: string, reason?: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) {
      const err: any = new Error('Pesanan tidak ditemukan');
      err.statusCode = 404;
      err.code = 'ORDER_NOT_FOUND';
      throw err;
    }

    if (order.status !== 'PENDING') {
      const err: any = new Error('Hanya pesanan berstatus PENDING yang dapat dibatalkan');
      err.statusCode = 400;
      err.code = 'CANNOT_CANCEL_ORDER';
      throw err;
    }

    // Return stock atomically
    const updatedOrder = await prisma.$transaction(async tx => {
      for (const item of order.items) {
        await tx.book.update({
          where: { id: item.bookId },
          data: { stock: { increment: item.qty } },
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelReason: reason || 'Dibatalkan oleh pembeli',
        },
      });
    });

    // Send cancellation email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (user) {
      try {
        await emailService.sendOrderCancelled(user.email, order.orderNumber, reason);
      } catch (e) {
        console.error('Cancellation email failed:', e);
      }
    }

    return updatedOrder;
  },

  async handlePaymentSuccess(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: { select: { email: true, name: true } } },
    });

    if (!order) return;

    if (order.status !== 'PAID') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      // Send payment success email
      if (order.user?.email) {
        try {
          await emailService.sendPaymentSuccess(order.user.email, order.orderNumber);
        } catch (e) {
          console.error('Payment success email failed:', e);
        }
      }
    }

    return order;
  },

  async handlePaymentFailed(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: { select: { email: true } } },
    });

    if (!order) return;

    if (order.status === 'PENDING') {
      // Return stock
      await prisma.$transaction(async tx => {
        for (const item of order.items) {
          await tx.book.update({
            where: { id: item.bookId },
            data: { stock: { increment: item.qty } },
          });
        }

        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            cancelReason: 'Pembayaran gagal atau kedaluwarsa',
          },
        });
      });

      // Send payment failed email
      if (order.user?.email) {
        try {
          await emailService.sendPaymentFailed(order.user.email, order.orderNumber);
        } catch (e) {
          console.error('Payment failed email failed:', e);
        }
      }
    }
  },

  async updateOrderStatus(
    orderId: string,
    status: string,
    trackingData?: { courier: string; trackingNumber: string }
  ) {
    const validStatuses = [
      'PENDING',
      'PAID',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
      'REFUNDED',
    ];
    if (!validStatuses.includes(status)) {
      const err: any = new Error('Status pesanan tidak valid');
      err.statusCode = 400;
      err.code = 'INVALID_STATUS';
      throw err;
    }

    const data: any = { status };
    if (status === 'PAID') data.paidAt = new Date();
    if (status === 'SHIPPED') {
      data.shippedAt = new Date();
      if (trackingData) {
        data.trackingNumber = trackingData.trackingNumber;
        data.courier = trackingData.courier;
      }
    }
    if (status === 'DELIVERED') data.deliveredAt = new Date();
    if (status === 'CANCELLED') data.cancelledAt = new Date();

    const order = await prisma.order.update({
      where: { id: orderId },
      data,
      include: { user: { select: { email: true, name: true } } },
    });

    // Send notification emails based on status
    if (order.user?.email) {
      try {
        if (status === 'SHIPPED' && trackingData) {
          const trackingUrl = `https://www.${trackingData.courier.toLowerCase()}.co.id/tracking/${trackingData.trackingNumber}`;
          await emailService.sendOrderShipped(
            order.user.email,
            order.orderNumber,
            trackingData.courier,
            trackingData.trackingNumber,
            trackingUrl
          );
        } else if (status === 'DELIVERED') {
          await emailService.sendOrderDelivered(order.user.email, order.orderNumber);
        }
      } catch (e) {
        console.error('Status update email failed:', e);
      }
    }

    return order;
  },
};
