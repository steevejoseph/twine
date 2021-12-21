import * as mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  name: string;
  username: string;
  password: string;
}

export const schema = new mongoose.Schema(
  {
    name: String,
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export const model = mongoose.model<IUser>('User', schema);

export const cleanCollection = () => model.remove({}).exec();

export default model;
