import { Router } from 'express';
import passport from 'passport';
import userRouter from './users';
import { login } from '../controllers/users';

const router = Router();

router.post(
  '/signup',
  passport.authenticate('signup', {
    session: false,
    passReqToCallback: true,
  }),
  login,
);

router.post('/login', login);

router.use(
  '/users',
  passport.authenticate('jwt', { session: false }),
  userRouter,
);

export default router;
