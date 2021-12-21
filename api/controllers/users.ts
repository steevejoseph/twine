import mongoose from 'mongoose';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { RequestHandler } from 'express';
import { userModel as userModel } from '../models/user';

mongoose.connect(`${process.env.MONGO_ATLAS_URL}`);

/* GET users listing. */
export const getUsers: RequestHandler = (req, res) => {
  userModel.find({}, (err, users) => {
    if (err) {
      res.status(500).json(err);
    }

    res.status(200).json(users);
  });
};

export const login: RequestHandler = async (req, res, next) => {
  passport.authenticate('login', async (err, user) => {
    try {
      if (err || !user) {
        const error = new Error('An error occurred.');

        return next(error);
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        const body = { _id: user._id, email: user.email };
        const JWT_SECRET = process.env.JWT_SECRET as string;
        const token = jwt.sign({ user: body }, JWT_SECRET);

        return res.json({ token });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
};
