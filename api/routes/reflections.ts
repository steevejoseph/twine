import { Router } from 'express';
import {
  uploadReflection,
  requestReflections,
} from '../controllers/reflections';
import multer from 'multer';
import fs from 'fs';

const router = Router();

const limits = { fileSize: 1000 * 1000 * 10 }; // limit to 10mb
const imgdir = './uploads';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(imgdir)) {
      fs.mkdirSync(imgdir);
    }
    cb(null, imgdir);
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage, limits });

router.post('/request', requestReflections);
router.post('/upload', upload.array('image'), uploadReflection);
export default router;
