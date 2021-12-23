import mongoose from 'mongoose';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { RequestHandler } from 'express';
import { User } from '../models/user';

mongoose.connect(`${process.env.MONGO_ATLAS_URL}`);

/**
 * Gets the list of users in the DB (debug use)
 * @param req the request body
 * @param res the response body
 * @param next the next middleware to run after logging in
 * @returns 200 with the token on success
 * @exception error logging in
 */
export const getUsers: RequestHandler = (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      res.status(500).json(err);
    }

    res.status(200).json(users);
  });
};

/**
 * Logs the user into the API using PassportJS
 * @param req the request body
 * @param res the response body
 * @param next the next middleware to run after logging in
 * @returns 200 with the token on success
 * @exception error logging in
 */
export const login: RequestHandler = async (req, res, next) => {
  passport.authenticate('login', async (err, user) => {
    try {
      if (err || !user) {
        const error = new Error('An error occurred.');

        return next(error);
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        const JWT_SECRET = process.env.JWT_SECRET as string;
        const token = jwt.sign({ user }, JWT_SECRET);
        return res.json({ token });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
};
