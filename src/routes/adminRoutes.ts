import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// Protect all admin routes: require authentication + ADMIN role
router.use(authMiddleware, requireRole('ADMIN'));

// Dashboard Stats
router.get('/stats/overview', adminController.getStats);

// Orders Management
router.get('/orders', adminController.getAllOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

// Books Management
router.get('/books', adminController.getAllBooks);
router.post('/books', adminController.createBook);
router.patch('/books/:id', adminController.updateBook);
router.delete('/books/:id', adminController.deleteBook);

export default router;
