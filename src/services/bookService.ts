import { prisma } from '../config/database';

export interface BookFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  author?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  inStock?: boolean;
}

export const bookService = {
  async getAll(options: BookFilterOptions) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 12));
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (options.search) {
      where.OR = [
        { title: { contains: options.search } },
        { author: { contains: options.search } },
        { description: { contains: options.search } },
      ];
    }

    if (options.category) {
      where.category = { slug: options.category };
    }

    if (options.author) {
      where.author = { contains: options.author };
    }

    if (options.inStock) {
      where.stock = { gt: 0 };
    }

    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      where.price = {};
      if (options.minPrice !== undefined) where.price.gte = options.minPrice;
      if (options.maxPrice !== undefined) where.price.lte = options.maxPrice;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (options.sortBy === 'price_asc') orderBy = { price: 'asc' };
    if (options.sortBy === 'price_desc') orderBy = { price: 'desc' };
    if (options.sortBy === 'popular') orderBy = { averageRating: 'desc' };
    if (options.sortBy === 'newest') orderBy = { createdAt: 'desc' };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.book.count({ where }),
    ]);

    return {
      books,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getBySlug(slug: string) {
    const book = await prisma.book.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!book) {
      const err: any = new Error('Buku tidak ditemukan');
      err.statusCode = 404;
      err.code = 'BOOK_NOT_FOUND';
      throw err;
    }

    return book;
  },

  async create(data: any) {
    return prisma.book.create({ data });
  },

  async update(id: string, data: any) {
    return prisma.book.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.book.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
