import { prisma } from '../config/database';

export const reviewService = {
  async createReview(userId: string, bookId: string, rating: number, comment?: string) {
    // Verify user purchased this book (verified purchase)
    const order = await prisma.order.findFirst({
      where: {
        userId,
        status: { in: ['DELIVERED', 'SHIPPED'] },
        items: { some: { bookId } },
      },
    });

    const review = await prisma.review.create({
      data: {
        userId,
        bookId,
        rating: Math.min(5, Math.max(1, rating)),
        comment,
        verifiedPurchase: !!order,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        book: { select: { id: true, title: true } },
      },
    });

    // Update book average rating
    await this.updateBookRating(bookId);

    return review;
  },

  async updateBookRating(bookId: string) {
    const reviews = await prisma.review.findMany({
      where: { bookId },
      select: { rating: true },
    });

    if (reviews.length === 0) return;

    const average = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await prisma.book.update({
      where: { id: bookId },
      data: {
        averageRating: Math.round(average * 10) / 10, // 1 decimal
        reviewCount: reviews.length,
      },
    });
  },

  async getBookReviews(bookId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { bookId },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { bookId } }),
    ]);

    return {
      reviews,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getRatingDistribution(bookId: string) {
    const reviews = await prisma.review.findMany({
      where: { bookId },
      select: { rating: true },
    });

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      distribution[r.rating as keyof typeof distribution]++;
    });

    return distribution;
  },
};
