import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { orderService } from '../services/orderService';

export const orderController = {
  async checkout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { addressId, shippingAddress, couponCode, notes } = req.body;

      const result = await orderService.checkout({
        userId,
        addressId,
        shippingAddress,
        couponCode,
        notes,
      });

      return res.status(201).json({
        success: true,
        message: 'Pesanan berhasil dibuat, silakan lakukan pembayaran',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async getUserOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const orders = await orderService.getUserOrders(userId);
      return res.status(200).json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  },

  async getOrderDetail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const order = await orderService.getOrderDetail(userId, id);
      return res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },

  async cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { reason } = req.body;
      const order = await orderService.cancelOrder(userId, id, reason);
      return res
        .status(200)
        .json({ success: true, message: 'Pesanan berhasil dibatalkan', data: order });
    } catch (err) {
      next(err);
    }
  },
};
