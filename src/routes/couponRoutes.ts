import { Router } from 'express';
import { couponController } from '../controllers/couponController';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// Public - validate coupon for checkout
router.post('/validate', authMiddleware, couponController.validateCoupon);

// Admin only
router.use(authMiddleware, requireRole('ADMIN'));
router.post('/', couponController.createCoupon);
router.get('/', couponController.getAllCoupons);
router.delete('/:id', couponController.deactivateCoupon);

export default router;
