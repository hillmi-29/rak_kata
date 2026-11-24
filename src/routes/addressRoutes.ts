import { Router } from 'express';
import { addressController } from '../controllers/addressController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', addressController.list);
router.post('/', addressController.create);
router.patch('/:id', addressController.update);
router.delete('/:id', addressController.remove);

export default router;
