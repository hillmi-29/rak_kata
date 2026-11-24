import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { addressService } from '../services/addressService';

function validate(body: any) {
  const required = ['recipient', 'phone', 'address', 'province', 'city', 'postalCode'];
  const missing = required.filter(key => !body?.[key] || String(body[key]).trim() === '');
  if (missing.length > 0) {
    const err: any = new Error(`Field wajib belum lengkap: ${missing.join(', ')}`);
    err.statusCode = 400;
    err.code = 'INVALID_ADDRESS';
    throw err;
  }
}

export const addressController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const addresses = await addressService.list(req.user!.userId);
      return res.status(200).json({ success: true, data: addresses });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      validate(req.body);
      const address = await addressService.create(req.user!.userId, req.body);
      return res
        .status(201)
        .json({ success: true, message: 'Alamat berhasil ditambahkan', data: address });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const address = await addressService.update(req.user!.userId, req.params.id, req.body);
      return res
        .status(200)
        .json({ success: true, message: 'Alamat berhasil diperbarui', data: address });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await addressService.remove(req.user!.userId, req.params.id);
      return res.status(200).json({ success: true, message: 'Alamat berhasil dihapus' });
    } catch (err) {
      next(err);
    }
  },
};
