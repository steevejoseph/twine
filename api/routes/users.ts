import { getUsers, signup } from '../controllers/users';
import { Router } from 'express';

const router = Router();

router.get('/', getUsers);
router.post('/signup', signup);
// router.post('/login', login);

export default router;
