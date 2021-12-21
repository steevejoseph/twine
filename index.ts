import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import logger from 'morgan';
import mongoose from 'mongoose';
import router from './api/routes';

const app = express();
const PORT = process.env.PORT || 3000;
mongoose.connect(`${process.env.MONGO_ATLAS_URL}`);

mongoose.connection.on('open', () => console.log('Connected to mongo server.'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* GET home page. */
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
});

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Express Typescript app @ http://localhost:${PORT}`);
});

export default app;
