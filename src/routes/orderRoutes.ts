import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', orderController.checkout);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderDetail);
router.post('/:id/cancel', orderController.cancelOrder);

export default router;
