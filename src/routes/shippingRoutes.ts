import { Router } from 'express';
import { shippingService } from '../services/shippingService';

const router = Router();

// Public shipping estimate. Uses RajaOngkir when configured, otherwise a
// transparent weight-based fallback so checkout still works in development.
router.post('/rates', async (req, res, next) => {
  try {
    const { cityId, weight, courier } = req.body || {};
    if (!cityId || !weight) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_DATA', message: 'cityId dan weight wajib diisi' },
      });
    }

    const rates = await shippingService.calculateShipping(
      { cityId: process.env.SHOP_CITY_ID || '152' },
      { cityId: String(cityId) },
      Number(weight),
      String(courier || 'jne').toLowerCase()
    );

    return res.status(200).json({ success: true, data: rates });
  } catch (err) {
    next(err);
  }
});

export default router;
