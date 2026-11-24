import { prisma } from '../config/database';

export const cartService = {
  async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                slug: true,
                price: true,
                stock: true,
                coverImage: true,
                weight: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              book: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  price: true,
                  stock: true,
                  coverImage: true,
                  weight: true,
                  isActive: true,
                },
              },
            },
          },
        },
      });
    }

    const subtotal = cart.items.reduce((acc, item) => acc + item.book.price * item.qty, 0);
    const totalWeight = cart.items.reduce((acc, item) => acc + item.book.weight * item.qty, 0);
    const itemCount = cart.items.reduce((acc, item) => acc + item.qty, 0);

    return {
      id: cart.id,
      items: cart.items.map(item => ({
        id: item.id,
        bookId: item.bookId,
        qty: item.qty,
        book: item.book,
        subtotal: item.book.price * item.qty,
        isOutOfStock: item.book.stock < item.qty,
      })),
      summary: {
        subtotal,
        totalWeight,
        itemCount,
      },
    };
  },

  async addItem(userId: string, bookId: string, qty: number = 1) {
    if (qty < 1) {
      const err: any = new Error('Jumlah buku minimal 1');
      err.statusCode = 400;
      err.code = 'INVALID_QUANTITY';
      throw err;
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || !book.isActive) {
      const err: any = new Error('Buku tidak ditemukan atau tidak aktif');
      err.statusCode = 404;
      err.code = 'BOOK_NOT_FOUND';
      throw err;
    }

    if (book.stock < qty) {
      const err: any = new Error(`Stok buku hanya tersisa ${book.stock}`);
      err.statusCode = 400;
      err.code = 'INSUFFICIENT_STOCK';
      throw err;
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_bookId: {
          cartId: cart.id,
          bookId,
        },
      },
    });

    let item;
    if (existingItem) {
      const newQty = existingItem.qty + qty;
      if (book.stock < newQty) {
        const err: any = new Error(`Stok buku tidak mencukupi (maksimal ${book.stock})`);
        err.statusCode = 400;
        err.code = 'INSUFFICIENT_STOCK';
        throw err;
      }
      item = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { qty: newQty },
      });
    } else {
      item = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          bookId,
          qty,
        },
      });
    }

    return item;
  },

  async updateItemQty(userId: string, itemId: string, qty: number) {
    if (qty < 1) {
      const err: any = new Error('Jumlah buku minimal 1');
      err.statusCode = 400;
      err.code = 'INVALID_QUANTITY';
      throw err;
    }

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      const err: any = new Error('Keranjang tidak ditemukan');
      err.statusCode = 404;
      err.code = 'CART_NOT_FOUND';
      throw err;
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { book: true },
    });

    if (!item) {
      const err: any = new Error('Item tidak ditemukan di keranjang');
      err.statusCode = 404;
      err.code = 'ITEM_NOT_FOUND';
      throw err;
    }

    if (item.book.stock < qty) {
      const err: any = new Error(`Stok buku hanya tersisa ${item.book.stock}`);
      err.statusCode = 400;
      err.code = 'INSUFFICIENT_STOCK';
      throw err;
    }

    return prisma.cartItem.update({
      where: { id: itemId },
      data: { qty },
    });
  },

  async removeItem(userId: string, itemId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      const err: any = new Error('Keranjang tidak ditemukan');
      err.statusCode = 404;
      err.code = 'CART_NOT_FOUND';
      throw err;
    }

    return prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });
  },

  async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return true;
  },

  async mergeCart(userId: string, guestItems: Array<{ bookId: string; qty: number }>) {
    for (const item of guestItems) {
      try {
        await this.addItem(userId, item.bookId, item.qty);
      } catch (e) {
        // Skip items that have stock issues
      }
    }
    return this.getOrCreateCart(userId);
  },
};
