import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import logger from 'morgan';
import mongoose from 'mongoose';
import router from './api/routes';
import passport from 'passport';

const app = express();
mongoose.connect(`${process.env.MONGO_ATLAS_URL}`, (err) => {
  if (err) {
    console.log(err);
  }
  console.log('Connected to mongo server.');
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

require('./api/config/passport');

// TODO: Reenable passport sessions
// app.use(passport.session());

/* GET home page. */
router.get('/', (req, res) => {
  // @steeve: reenable if/when a frontend has been decided
  // res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
  res.status(200).json();
});

app.use('/api', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express Typescript app @ http://localhost:${PORT}`);
});

export default app;
