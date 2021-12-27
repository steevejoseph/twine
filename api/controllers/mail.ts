import { RequestHandler } from 'express';
import nodemailer from 'nodemailer';
import { IUser } from '../models/user';

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
export const sendIntroEmailToUser = (user: IUser) => {
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
      throw new Error(err.message);
    }
    return info;
  });
};

/**
 * Utility function for sending out emails when a reflection/referral is requested
 * @param reflectee the person asking for relflections
 * @param reflectors the person granting the request
 * @returns an array of sent message info that describes the outcome of each email transmission
 */
export const sendEmailToReflectors = (
  reflectee: string,
  reflectors: string[],
) => {
  if (reflectors.length < 1) {
    throw new Error('At least 1 reflector must be specified');
  } else if (reflectors.length > 3) {
    throw new Error('No more than 3 reflectors can be specified at this time');
  }

  const emails = reflectors.map((reflector) => {
    return {
      from: '"Your Feedback Requested" <twinedapp@gmail.com>',
      to: reflector,
      subject: 'A Friend Has Requested A Referral! :)',
      html: `<h1>Hi there!</h1>
                         <p>Your friend ${reflectee} has asked you to give them a review.</p>
                         <a href="${'https://twined.herokuapp.com/'}"> Click here to leave them one!</a>
                        `,
    };
  });

  const promises = emails.map((e) => transporter.sendMail(e));
  return Promise.all(promises);
};
