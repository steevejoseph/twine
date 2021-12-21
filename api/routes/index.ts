import { Router } from 'express';
import passport from 'passport';
import userRouter from './users';
import { login } from '../controllers/users';
import { requestReferrals, sendIntroEmailToUser } from '../middleware/mail';

const router = Router();

router.post(
  '/signup',
  passport.authenticate('signup', {
    session: false,
    passReqToCallback: true,
  }),
  sendIntroEmailToUser,
  login,
);

router.post('/login', login);
router.post('/refs', requestReferrals);

router.use(
  '/users',
  passport.authenticate('jwt', { session: false }),
  userRouter,
);

export default router;
