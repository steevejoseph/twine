import passport from 'passport';
import jwt from 'jsonwebtoken';
import { RequestHandler } from 'express';
import { IUser, User } from '../models/user';
import { decodeTokenFromRequest } from '../utils/auth';
import { sendIntroEmailToUser } from './mail';

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
        if (error) return res.status(500).json(error);

        const JWT_SECRET = process.env.JWT_SECRET as string;
        const token = jwt.sign({ user }, JWT_SECRET);
        return res.status(200).json({ token });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
};

/**
 * Gets the list of users in the DB
 * @param req the request body
 * @param res the response body
 * @param next the next middleware to run after logging in
 * @returns 200 with the token on success
 * @exception error logging in
 */
export const getUsers: RequestHandler = (req, res) => {
  console.log(decodeTokenFromRequest(req));
  User.find({}, (err, users) => {
    if (err) {
      res.status(500).json(err);
    }

    res.status(200).json(users);
  });
};

export const getAllUsersExceptSelf: RequestHandler = (req, res) => {
  const decoded = decodeTokenFromRequest(req);
  const user: IUser = decoded.user as IUser;
  User.find({ email: { $ne: user.email } }, (err, users) => {
    if (err) {
      res.status(500).json(err);
    }

    res.status(200).json(users);
  });
};

export const getUsersExceptSelfAndFriends: RequestHandler = (req, res) => {
  const decoded = decodeTokenFromRequest(req);
  const user: IUser = decoded.user;
  User.find({
    email: { $ne: user.email, $nin: user.friends },
    new: true,
  }).exec((err, users) => {
    if (err) {
      res.status(500).json(err);
    }

    res.status(200).json(users);
  });
};

export const performNewUserSignupActions: RequestHandler = (req, res, next) => {
  const user: IUser = req.user as IUser;
  try {
    sendIntroEmailToUser(user);
    next();
  } catch (e) {
    return res.status(500).json(e);
  }
};
