import { RequestHandler } from 'express';
import axios, { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import Reflection, { IReflection } from '../models/reflection';

const createRequestOptions = (
  image: Express.Multer.File,
): AxiosRequestConfig => {
  const data = new FormData();
  const url = 'https://api.imgur.com/3/image';
  const headers = {
    Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
    ...data.getHeaders(),
  };

  data.append('image', image.buffer);
  data.append('name', image.originalname);

  const config: AxiosRequestConfig = {
    method: 'post',
    url,
    headers,
    data,
  };

  return config;
};

const makeReflectionFromImgurResponse = (
  data: unknown,
  reflectee: string,
  reflector: string,
) => {
  const reflection = data as IReflection;
  const { type, title, description, deletehash, link, name } = reflection;

  Reflection.create({
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
    const config = createRequestOptions(img);
    return axios(config)
      .then((response) =>
        makeReflectionFromImgurResponse(
          response.data.data,
          reflectee,
          reflector,
        ),
      )
      .catch((error) => console.log(error));
  });

  res.status(200).json(Promise.all(promises));
};
