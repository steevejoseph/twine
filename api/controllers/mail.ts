import { RequestHandler } from 'express';
import nodemailer from 'nodemailer';
import { IUser } from '../models/user';
import jwt, { JwtPayload } from 'jsonwebtoken';

const { TWINE_APP_GMAIL_USERNAME, TWINE_APP_GMAIL_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: TWINE_APP_GMAIL_USERNAME,
    pass: TWINE_APP_GMAIL_PASSWORD,
  },
  pool: true,
});

/**
 * Sends a welcome email to a user that has just joined
 * @param req request object
 * @param res response object
 * @param next next middleware to run after email is sent
 */
export const sendIntroEmailToUser: RequestHandler = (req, res, next) => {
  const user: IUser = req.user as IUser;
  const mailOptions = {
    from: '"Your new app for authentic connection" <twinedapp@gmail.com>',
    to: user.email,
    subject: 'Thanks for using twine! :)',
    html: `<h1>Hi there!</h1>
                 <p>Thank you for trying out twine, we hope you like it!
                    If you run into issues, have questions, or would like to contribute,
                    feel free to contact us at twineapp@gmail.com
                 </p>
                `,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    }
    console.log('Message send: %s', info.messageId);
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
  next();
};

/**
 * Utility function for sending out emails when a reflection/referral is requested
 * @param referee the person asking for relflections
 * @param referrers the person granting the request
 * @returns an array of sent message info that describes the outcome of each email transmission
 */
export const sendEmailToReflectors = (referee: string, referrers: string[]) => {
  if (referrers.length < 1) {
    throw new Error('At least 1 reflector must be specified');
  } else if (referrers.length > 3) {
    throw new Error('No more than 3 reflectors can be specified at this time');
  }

  const emails = referrers.map((r) => {
    return {
      from: '"Your Feedback Requested" <twinedapp@gmail.com>',
      to: r,
      subject: 'A Friend Has Requested A Referral! :)',
      html: `<h1>Hi there!</h1>
                         <p>Your friend ${referee} has asked you to give them a review.</p>
                         <a href="${'https://twined.herokuapp.com/'}"> Click here to leave them one!</a>
                        `,
    };
  });

  const promises = emails.map((e) => transporter.sendMail(e));
  return Promise.all(promises);
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
