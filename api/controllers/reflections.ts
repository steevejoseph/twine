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
  });
};

export const uploadReflection: RequestHandler = (req, res) => {
  const files = req.files as unknown as Express.Multer.File[];
  const { reflectee, reflector } = <{ reflectee: string; reflector: string }>(
    req.query
  );

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
      .catch((error) => console.log(error));
  });

  Promise.all(promises)
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
  sendEmailToReflectors(user.email, reflectors)
    .then((response) => res.status(204).json({ response }))
    .catch((err) => res.status(500).send(err));
};
