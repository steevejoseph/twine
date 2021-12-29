import { Router } from 'express';
import passport from 'passport';
import userRouter from './users';
import reflectionsRouter from './reflections';
import recommendationsRouter from './recommendations';
import { login, performNewUserSignupActions } from '../controllers/users';

const router = Router();

router.post(
  '/signup',
  passport.authenticate('signup', {
    session: false,
    passReqToCallback: true,
  }),
  performNewUserSignupActions,
  login,
);

router.post('/login', login);

router.use(
  '/users',
  passport.authenticate('jwt', { session: false }),
  userRouter,
);

router.use('/reflections', reflectionsRouter);
router.use('/recommendations', recommendationsRouter);

export default router;
