import { prisma } from '../config/database';

export const couponService = {
  async validateCoupon(code: string, userId: string, subtotal: number) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return { valid: false, message: 'Kode kupon tidak valid' };
    }

    if (!coupon.isActive) {
      return { valid: false, message: 'Kupon tidak aktif' };
    }

    if (coupon.expiresAt < new Date()) {
      return { valid: false, message: 'Kupon telah kedaluwarsa' };
    }

    if (coupon.usedCount >= coupon.maxUsage) {
      return { valid: false, message: 'Kupon sudah habis digunakan' };
    }

    if (subtotal < coupon.minSpend) {
      return {
        valid: false,
        message: `Minimal belanja Rp ${coupon.minSpend.toLocaleString('id-ID')}`,
      };
    }

    // Check user usage limit
    const userUsage = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });

    // Assuming max 1 use per user per coupon (can be configured)
    if (userUsage >= 1) {
      return { valid: false, message: 'Anda sudah menggunakan kupon ini' };
    }

    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = Math.floor((subtotal * coupon.value) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }

    return {
      valid: true,
      discount,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      } as const,
    };
  },

  async applyCoupon(couponId: string, userId: string, orderId: string) {
    return prisma.$transaction(async tx => {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });

      return tx.couponUsage.create({
        data: {
          couponId,
          userId,
          orderId,
        },
      });
    });
  },

  async createCoupon(data: {
    code: string;
    description?: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    minSpend?: number;
    maxDiscount?: number;
    maxUsage?: number;
    expiresAt: Date;
  }) {
    return prisma.coupon.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
      },
    });
  },

  async getAllCoupons() {
    return prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async deactivateCoupon(id: string) {
    return prisma.coupon.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
