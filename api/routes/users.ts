import {
  getAllUsersExceptSelf,
  getUsers,
  getUsersExceptSelfAndFriends,
  getUserById,
} from '../controllers/users';
import { Router } from 'express';

const router = Router();

router.get('/', getUsers);
router.get('/except-self', getAllUsersExceptSelf);
router.get('/except-self-friends', getUsersExceptSelfAndFriends);
router.get('/:userId', getUserById);

export default router;
