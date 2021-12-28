import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { IReflection } from './reflection';

export enum SEX {
  MALE = 'male',
  FEMALE = 'female',
}

export enum USER_TYPE {
  TEST = 'test',
  FREE = 'free',
  ADMIN = 'admin',
}

/**
 * Determines whether an email should be sent
 * @param user the user making the mail request
 * @returns a boolean representing whether the email should be sent
 */
export const shouldSendUserEmail = (user: IUser): boolean => {
  const dontSend = [USER_TYPE.TEST, USER_TYPE.ADMIN];

  if (dontSend.includes(user.type)) {
    return false;
  }

  return true;
};

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  sex: SEX;
  seeking: SEX;
  friends: string[];
  reflectionsReceived: IReflection[];
  reflectionsGiven: IReflection[];
  birthday: Date;
  type: USER_TYPE;
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
    friends: {
      type: [String],
      default: [],
    },
    gender: {
      type: String,
    },
    seeking: {
      type: String,
    },
    birthday: {
      type: Date,
    },
    type: {
      type: String,
    },
    reflectionsReceived: {
      type: [Schema.Types.ObjectId],
      ref: 'Reflection',
      default: [],
    },
    reflectionsGiven: {
      type: [Schema.Types.ObjectId],
      ref: 'Reflection',
      default: [],
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
