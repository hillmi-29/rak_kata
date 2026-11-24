import { prisma } from '../config/database';

export const adminService = {
  async getDashboardStats() {
    const [totalUsers, totalOrders, paidOrders, lowStockBooks] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.findMany({
        where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
        select: { total: true },
      }),
      prisma.book.findMany({
        where: { stock: { lte: 5 }, isActive: true },
        select: { id: true, title: true, stock: true, coverImage: true },
        take: 10,
      }),
    ]);

    const totalRevenue = paidOrders.reduce((acc, curr) => acc + curr.total, 0);

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return {
      totalRevenue,
      totalOrders,
      totalUsers,
      conversionRate: totalUsers > 0 ? Number(((totalOrders / totalUsers) * 100).toFixed(1)) : 0,
      lowStockBooks,
      recentOrders,
    };
  },

  async getAllBooks(filters?: { search?: string; category?: string; status?: string }) {
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { author: { contains: filters.search } },
        { isbn: { contains: filters.search } },
      ];
    }
    if (filters?.category) {
      where.category = { slug: filters.category };
    }
    if (filters?.status === 'active') where.isActive = true;
    if (filters?.status === 'inactive') where.isActive = false;

    return prisma.book.findMany({
      where,
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 300,
    });
  },

  async getAllOrders(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateOrderStatus(orderId: string, status: any) {
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
    if (status === 'SHIPPED') data.shippedAt = new Date();
    if (status === 'DELIVERED') data.deliveredAt = new Date();
    if (status === 'CANCELLED') data.cancelledAt = new Date();

    return prisma.order.update({
      where: { id: orderId },
      data,
    });
  },

  async createBook(data: {
    title: string;
    slug?: string;
    author: string;
    isbn?: string;
    description?: string;
    price: number;
    stock: number;
    coverImage?: string;
    publisher?: string;
    publishedYear?: number;
    pages?: number;
    weight?: number;
    categoryId: string;
  }) {
    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    return prisma.book.create({
      data: {
        ...data,
        slug,
      },
    });
  },

  async updateBook(id: string, data: any) {
    return prisma.book.update({
      where: { id },
      data,
    });
  },

  async deleteBook(id: string) {
    return prisma.book.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
