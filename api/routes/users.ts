import { getUsers } from '../controllers/users';
import { Router } from 'express';

const router = Router();

router.get('/', getUsers);
export default router;
