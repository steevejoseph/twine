import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/user';

/**
 * Decodes the token from a request's header, returns the corresponding object
 *
 * @param req The request
 * @returns The decoded token's payload
 */
export const decodeTokenFromRequest = (req: Request): any => {
  const token = req.headers.authorization?.split(' ')[1] as string;
  try {
    return jwt.verify(token, `${process.env.JWT_SECRET}`);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const getUserFromRequest = (req: Request) => {
  const decoded = decodeTokenFromRequest(req);
  const user: IUser = decoded.user;
  return user;
};
