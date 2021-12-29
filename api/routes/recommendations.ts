import { Router } from 'express';
import {
  createRecommendation,
  getRecommendations,
} from '../controllers/recommendations';

const router = Router();

router.get('/', getRecommendations);
router.post('/', createRecommendation);
export default router;
