import { Router } from 'express';
import { bookController } from '../controllers/bookController';

const router = Router();

router.get('/', bookController.getAll);
router.get('/:slug', bookController.getBySlug);

export default router;
