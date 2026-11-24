import { Request, Response, NextFunction } from 'express';
import { couponService } from '../services/couponService';
import { AuthenticatedRequest } from '../middleware/auth';

export const couponController = {
  async validateCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { code, subtotal } = req.body;

      if (!code || !subtotal) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_DATA', message: 'Kode kupon dan subtotal wajib diisi' },
        });
      }

      const result = await couponService.validateCoupon(code, userId, Number(subtotal));
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async createCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.createCoupon(req.body);
      return res
        .status(201)
        .json({ success: true, message: 'Kupon berhasil dibuat', data: coupon });
    } catch (err) {
      next(err);
    }
  },

  async getAllCoupons(req: Request, res: Response, next: NextFunction) {
    try {
      const coupons = await couponService.getAllCoupons();
      return res.status(200).json({ success: true, data: coupons });
    } catch (err) {
      next(err);
    }
  },

  async deactivateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await couponService.deactivateCoupon(id);
      return res.status(200).json({ success: true, message: 'Kupon dinonaktifkan' });
    } catch (err) {
      next(err);
    }
  },
};
