import { Router } from 'express';
import { requestReflections } from '../controllers/mail';

const router = Router();

router.post('/request', requestReflections);
// router.post('/upload', (req, res, next) => {});
export default router;
