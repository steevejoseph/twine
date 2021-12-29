import mongoose from 'mongoose';

export interface IRecommendation extends mongoose.Document {
  from: string;
  to: string;
  by: string;
  cosigns: string[];
}

const RecommendationSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  by: {
    type: String,
    required: true,
  },
  cosigns: {
    type: [String],
  },
});

export const Recommendation = mongoose.model<IRecommendation>(
  'Recommendation',
  RecommendationSchema,
);
export default Recommendation;
