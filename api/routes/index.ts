import { Router } from 'express';
import passport from 'passport';
import userRouter from './users';
import reflectionsRouter from './reflections';
import { login } from '../controllers/users';
import { sendIntroEmailToUser } from '../controllers/mail';

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

router.use(
  '/users',
  passport.authenticate('jwt', { session: false }),
  userRouter,
);

router.use('/reflections', reflectionsRouter);

export default router;
