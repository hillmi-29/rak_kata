import { Request, Response, NextFunction } from 'express';
import { bookService } from '../services/bookService';

export const bookController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, category, minPrice, maxPrice, author, sortBy, inStock } =
        req.query;

      const result = await bookService.getAll({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 12,
        search: search as string,
        category: category as string,
        author: author as string,
        minPrice: minPrice ? parseInt(minPrice as string, 10) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice as string, 10) : undefined,
        sortBy: sortBy as any,
        inStock: inStock === 'true',
      });

      return res.status(200).json({
        success: true,
        data: result.books,
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const book = await bookService.getBySlug(slug);

      return res.status(200).json({
        success: true,
        data: book,
      });
    } catch (err) {
      next(err);
    }
  },
};
