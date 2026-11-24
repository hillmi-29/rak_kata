import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/adminService';
import { orderService } from '../services/orderService';

export const adminController = {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      return res.status(200).json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  },

  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const orders = await adminService.getAllOrders(status as string);
      return res.status(200).json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  },

  async getAllBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, category, status } = req.query;
      const books = await adminService.getAllBooks({
        search: search as string,
        category: category as string,
        status: status as string,
      });
      return res.status(200).json({ success: true, data: books });
    } catch (err) {
      next(err);
    }
  },

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, trackingNumber, courier } = req.body;
      const order = await orderService.updateOrderStatus(
        id,
        status,
        trackingNumber ? { trackingNumber, courier: courier || 'JNE' } : undefined
      );
      return res
        .status(200)
        .json({ success: true, message: 'Status pesanan berhasil diperbarui', data: order });
    } catch (err) {
      next(err);
    }
  },

  async createBook(req: Request, res: Response, next: NextFunction) {
    try {
      const book = await adminService.createBook(req.body);
      return res
        .status(201)
        .json({ success: true, message: 'Buku berhasil ditambahkan', data: book });
    } catch (err) {
      next(err);
    }
  },

  async updateBook(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const book = await adminService.updateBook(id, req.body);
      return res
        .status(200)
        .json({ success: true, message: 'Buku berhasil diperbarui', data: book });
    } catch (err) {
      next(err);
    }
  },

  async deleteBook(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await adminService.deleteBook(id);
      return res.status(200).json({ success: true, message: 'Buku berhasil dinonaktifkan' });
    } catch (err) {
      next(err);
    }
  },
};
