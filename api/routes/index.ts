import userRouter from './users';
import { Router } from 'express';

const router = Router();

router.use('/users', userRouter);

export default router;
