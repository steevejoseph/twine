import mongoose from 'mongoose';
import { Handler, User } from '../types';

mongoose.connect(`${process.env.MONGO_ATLAS_URL}`);

/* GET users listing. */
export const getUsers: Handler = (req, res) => {
  res.send('respond with a resource');
};

export const addUser: Handler = (req, res) => {
  const { email, password, name } = req.body;
  const userJS: User = { email, password, name };
  console.log(req.body);
  res.status(200).send();
};
