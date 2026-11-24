import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/categoryService';

export const categoryController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getAll();
      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (err) {
      next(err);
    }
  },
};
