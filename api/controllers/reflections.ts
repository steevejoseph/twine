import { RequestHandler } from 'express';
import Reflection, { IReflection } from '../models/reflection';
import fs from 'fs';

import { ImgurClient } from 'imgur';
import { ImgurApiResponse, Payload } from 'imgur/lib/common/types';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { sendEmailToReflectors } from './mail';
import { IUser } from '../models/user';

const clientId = `${process.env.IMGUR_CLIENT_ID}}`;
const client = new ImgurClient({ clientId });

/**
 * Takes an imgur response, and creates the corresponding Reflection doument
 *
 * @param data the data portion of the imgur api response
 * @param reflectee the person getting the reflection
 * @param reflector the person giving the reflection
 * @returns the new reflection, or an error if create() failed
 */
const makeReflectionFromImgurResponse = (
  data: unknown,
  reflectee: string,
  reflector: string,
) => {
  const reflection = data as IReflection;
  const { type, title, description, deletehash, link, name } = reflection;

  return Reflection.create({
    type,
    reflectee,
    reflector,
    title,
    description,
    deletehash,
    link,
    name,
  })
    .then((r) => r)
    .catch((err) => new Error(err));
};

/**
 * Takes in a list of iamge/video files, and makes the list of reflections
 *
 * @param files the list of files in the request
 * @param reflectee the person that is receiving the reflection
 * @param reflector  the person that is giving the reflextion
 * @returns
 */
const saveReflectionsToDb = (
  files: Express.Multer.File[],
  reflectee: string,
  reflector: string,
) => {
  const promises = files.map((img) => {
    const payload: Payload = {
      type: 'file',
      name: img.originalname,
      disable_audio: '0',
      image: img.path,
    };

    return client
      .upload(payload)
      .then((response) => {
        fs.unlinkSync(img.path);
        const cast = response as unknown as ImgurApiResponse;
        return makeReflectionFromImgurResponse(cast.data, reflectee, reflector);
      })
      .catch((error) => new Error(error));
  });

  return Promise.all(promises);
};

/**
 * Route handler for uploading reflections
 * @param req the request
 * @param res the response
 */
export const uploadReflection: RequestHandler = (req, res) => {
  const files = req.files as unknown as Express.Multer.File[];
  const { reflectee, reflector } = <{ reflectee: string; reflector: string }>(
    req.query
  );

  return saveReflectionsToDb(files, reflectee, reflector)
    .then((data) => res.status(200).json({ data }))
    .catch((err) => res.status(500).json(err));
};

/**
 * Sends email to list of reflectors
 * @param req the request object that contains the token that contains the requestor info
 * @param res the response body
 */
export const requestReflections: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1] as string;
  const json = jwt.decode(token) as JwtPayload;
  const user: IUser = json.user;

  const { reflectors } = req.body;
  return sendEmailToReflectors(user.email, reflectors)
    .then((response) => res.status(204).json({ response }))
    .catch((err) => res.status(500).send(err));
};
