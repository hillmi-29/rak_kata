import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/reviewService';
import { AuthenticatedRequest } from '../middleware/auth';

export const reviewController = {
  async createReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { bookId, rating, comment } = req.body;

      if (!bookId || !rating) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_DATA', message: 'bookId dan rating wajib diisi' },
        });
      }

      const review = await reviewService.createReview(userId, bookId, Number(rating), comment);
      return res
        .status(201)
        .json({ success: true, message: 'Ulasan berhasil ditambahkan', data: review });
    } catch (err) {
      next(err);
    }
  },

  async getBookReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookId } = req.params;
      const { page, limit } = req.query;

      const result = await reviewService.getBookReviews(
        bookId,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 10
      );

      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getRatingDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookId } = req.params;
      const distribution = await reviewService.getRatingDistribution(bookId);
      return res.status(200).json({ success: true, data: distribution });
    } catch (err) {
      next(err);
    }
  },
};
