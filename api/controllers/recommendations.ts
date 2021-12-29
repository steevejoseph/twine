import { RequestHandler } from 'express';
import Recommendation, { IRecommendation } from '../models/recommendation';
import { getUserFromRequest } from '../utils/auth';

export const getRecommendations: RequestHandler = async (req, res) => {
  try {
    const recommendations = await Recommendation.find({});
    res.status(200).json({ recommendations });
  } catch (e) {
    res.status(500).json(e);
  }
};
export const createRecommendation: RequestHandler = async (req, res) => {
  try {
    const user = getUserFromRequest(req);
    const { from, to } = <IRecommendation>req.body;
    const by = user.email;

    const recommendation = await Recommendation.create({
      from,
      to,
      by,
    });

    res.status(200).json({ recommendation });
  } catch (e) {
    res.status(500).json(e);
  }
};
