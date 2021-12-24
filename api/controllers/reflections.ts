import { RequestHandler } from 'express';
import Reflection, { IReflection } from '../models/reflection';
import fs from 'fs';

import { ImgurClient } from 'imgur';
import { ImgurApiResponse, Payload } from 'imgur/lib/common/types';

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
