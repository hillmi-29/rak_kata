import { Router } from 'express';
import { reviewController } from '../controllers/reviewController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/book/:bookId', reviewController.getBookReviews);
router.get('/book/:bookId/distribution', reviewController.getRatingDistribution);

// Protected routes
router.post('/', authMiddleware, reviewController.createReview);

export default router;
