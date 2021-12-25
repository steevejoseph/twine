import { getAllUsersExceptSelf, getUsers } from '../controllers/users';
import { Router } from 'express';

const router = Router();

router.get('/', getUsers);
router.get('/except-self', getAllUsersExceptSelf);

export default router;
