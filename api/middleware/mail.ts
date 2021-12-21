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

export const sendEmailToReferrers = (
  referee: string,
  referrers: [string, string, string],
) => {
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

  console.log(emails);
  const promises = emails.map((e) =>
    transporter.sendMail(e).then((f) => console.log(f)),
  );
  Promise.all(promises);
};

export const requestReferrals: RequestHandler = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] as string;
  const json = jwt.decode(token) as JwtPayload;
  const user: IUser = json.user;

  const { referrers } = req.body;
  sendEmailToReferrers(user.email, referrers);
  next();
};
