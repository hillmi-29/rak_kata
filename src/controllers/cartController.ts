import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { cartService } from '../services/cartService';

export const cartController = {
  async getCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const cart = await cartService.getOrCreateCart(userId);
      return res.status(200).json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  },

  async addItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { bookId, qty } = req.body;
      const item = await cartService.addItem(userId, bookId, Number(qty) || 1);
      return res
        .status(201)
        .json({ success: true, message: 'Buku berhasil ditambahkan ke keranjang', data: item });
    } catch (err) {
      next(err);
    }
  },

  async updateItemQty(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { itemId } = req.params;
      const { qty } = req.body;
      const item = await cartService.updateItemQty(userId, itemId, Number(qty));
      return res
        .status(200)
        .json({ success: true, message: 'Jumlah buku berhasil diperbarui', data: item });
    } catch (err) {
      next(err);
    }
  },

  async removeItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { itemId } = req.params;
      await cartService.removeItem(userId, itemId);
      return res
        .status(200)
        .json({ success: true, message: 'Item berhasil dihapus dari keranjang' });
    } catch (err) {
      next(err);
    }
  },

  async clearCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      await cartService.clearCart(userId);
      return res.status(200).json({ success: true, message: 'Keranjang berhasil dikosongkan' });
    } catch (err) {
      next(err);
    }
  },

  async mergeCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_DATA', message: 'Daftar item tidak valid' },
        });
      }
      const cart = await cartService.mergeCart(userId, items);
      return res
        .status(200)
        .json({ success: true, message: 'Keranjang tamu berhasil digabungkan', data: cart });
    } catch (err) {
      next(err);
    }
  },
};
