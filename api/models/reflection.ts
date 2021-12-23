import mongoose from 'mongoose';
export interface IReflection extends mongoose.Document {
  reflectee: string;
  type: string;
  title?: string;
  description?: string;
  deletehash: string;
  link: string;
  name: string;
  reflector: string;
}

const ReflectionSchema = new mongoose.Schema({
  reflectee: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
  title: String,
  description: String,
  deletehash: String,
  link: { type: String, required: true },
  name: String,
  // TODO: Add timestamps for upload and updating
  reflector: {
    type: String,
    required: true,
  },
});

export const Reflection = mongoose.model<IReflection>(
  'Reflection',
  ReflectionSchema,
);
export default Reflection;
