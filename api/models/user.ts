import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { IReflection } from './reflection';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  reflections: IReflection[];
  isValidPassword(candidate: string): boolean;
}

export const UserSchema = new mongoose.Schema(
  {
    email: {
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

/**
 * Hashes password before saving it in db
 */
UserSchema.pre('save', async function (next) {
  const user = this;
  const hash = await bcrypt.hash(user.password, 10);
  user.password = hash;
  next();
});

/* Compares supplied password to hashed password in db
 * @param password plaintext password
 * @returns hashed password
 */
UserSchema.methods.isValidPassword = async function (password) {
  const user = this;
  const compare = await bcrypt.compare(password, user.password);

  return compare;
};

export const User = mongoose.model<IUser>('User', UserSchema);

export const cleanCollection = () => User.remove({}).exec();

export default User;
