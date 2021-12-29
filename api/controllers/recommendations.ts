import { RequestHandler } from 'express';
import Recommendation, { IRecommendation } from '../models/recommendation';
import User from '../models/user';
import { getUserFromRequest } from '../utils/auth';

/**
 * Gets all recommendations in DB
 *
 * @param req the request
 * @param res  the response
 * @returns 200 with a list of recommendations in DB
 * @exception 500 failure fetching recommendations from DB
 */
export const getRecommendations: RequestHandler = async (req, res) => {
  try {
    const recommendations = await Recommendation.find({});
    return res.status(200).json({ recommendations });
  } catch (e) {
    return res.status(500).json(e);
  }
};

/**
 * Given a recommendation (A-->B), checks for matching recommendation (B-->A)
 * If present, marks both recommendations' `isMatch` fields true
 * @param recommendation the newly created recommendation
 */
const checkForMatchingRecommendation = async (
  recommendation: IRecommendation,
) => {
  const { to, from } = recommendation;
  const match = await Recommendation.findOne({ from: to, to: from });

  if (match) {
    recommendation.isMatch = true;
    match.isMatch = true;

    await recommendation.save();
    await match.save();
  }
};

/**
 * Inserts a stored recommendation into 3 users:
 *   1. recommendation.to
 *   2. recommendation.from
 *   3. recommendation.by
 * @param stored the recommendation stored in DB
 */
const addRecommendationToUsers = async (stored: IRecommendation) => {
  const options = { new: true };

  await User.findOneAndUpdate(
    { email: stored.from },
    { $push: { outgoingRecommendations: stored._id } },
    options,
  );

  await User.findOneAndUpdate(
    { email: stored.to },
    { $push: { incomingRecommendations: stored._id } },
    options,
  );

  await User.findOneAndUpdate(
    { email: stored.by },
    { $push: { recommendationsMade: stored._id } },
    options,
  );
};

/**
 * Either creates a new recommendation completely,
 * or adds a cosign if the recommendation exists already
 * @param body object representing the recommendation to be created
 * @returns `existing` - the found recommendation, or a new recommendation
 */
const addCosignToExistingRecommendationOrCreateNew = async (
  body: IRecommendation,
) => {
  const { from, to, by } = body;

  const existing = await Recommendation.findOne({ from, to });
  if (existing) {
    /* Only push to cosigns on a new person making a recommendation */
    if (!existing.cosigns.includes(by) && !(existing.by === by)) {
      existing.cosigns.push(by);
    }

    return await existing.save();
  }

  const recommendation = await Recommendation.create({
    from,
    to,
    by,
  });

  await addRecommendationToUsers(recommendation);

  return recommendation;
};

/**
 *
 * @param req the request
 * @param res the response
 * @returns 200 on a successful upsert of a recommendation
 * @exception 500 error on either adding cosigns, creation, or checking for a matching recommendation
 */
export const upsertRecommendation: RequestHandler = async (req, res) => {
  try {
    const user = getUserFromRequest(req);
    const { from, to } = <IRecommendation>req.body;
    const by = user.email;

    const body = { from, to, by, ...req.body };
    const recommendation = await addCosignToExistingRecommendationOrCreateNew(
      body,
    );

    await checkForMatchingRecommendation(recommendation);

    return res.status(200).json({ recommendation });
  } catch (e) {
    return res.status(500).json(e);
  }
};
