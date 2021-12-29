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
      if (err) {
        return res.status(400).json({ message: `Bad request` });
      }

      if (!user) {
        return res.status(404).json({
          message: `Incorrect username or password`,
        });
      }

      req.login(user, { session: false }, async (error) => {
        if (error) {
          return res.status(400).json({ message: 'Bad request' });
        }

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

/**
 * Gets the list of users in the DB, except for the user making the request
 * @param req the request body
 * @param res the response body
 * @returns 200 with the the list of users on success
 * @exception error while fetching from DB
 */
export const getAllUsersExceptSelf: RequestHandler = (req, res) => {
  const decoded = decodeTokenFromRequest(req);
  const user: IUser = decoded.user;
  User.find({ email: { $ne: user.email } }, (err, users) => {
    if (err) {
      res.status(500).json(err);
    }

    res.status(200).json({ users });
  });
};

/**
 * Gets the list of users in the DB, except for
 *   1. the user making the request
 *   2. the user's friends
 * @param req the request body
 * @param res the response body
 * @returns 200 with the the list of users on success
 * @exception error while fetching from DB
 */
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

    res.status(200).json({ users });
  });
};

/**
 * Middleware that handles signup related side-effects
 * @param req the request
 * @param res the response
 * @param next the next middleware
 * @exception something went wrong while {sending email, etc}
 */
export const performNewUserSignupActions: RequestHandler = (req, res, next) => {
  const user: IUser = req.user as IUser;
  try {
    sendIntroEmailToUser(user);
    next();
  } catch (e) {
    return res.status(500).json(e);
  }
};

/**
 * Gets the user with the id that matches the request param
 * @param req the request
 * @param res the response
 * @returns 200 with the matching user from the DB
 * @exception 404 no user found with a matching id
 * @exception 500 various errors querying the DB (casting id for example)
 */
export const getUserById: RequestHandler = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: `User with id '${userId}' not found` });
    }

    return res.status(200).json({ user });
  } catch (e) {
    return res.status(500).json(e);
  }
};
