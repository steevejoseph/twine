import { Router } from 'express';
import {
  upsertRecommendation,
  getRecommendations,
} from '../controllers/recommendations';

const router = Router();

router.get('/', getRecommendations);
router.post('/', upsertRecommendation);
export default router;
