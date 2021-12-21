import mongoose from 'mongoose';
import { model as userModel } from '../models/user';
import { RequestHandler } from 'express';
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

export const signup: RequestHandler = (req, res) => {
  res.status(200).send();
};
