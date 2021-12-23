import { Router } from 'express';
import { requestReflections } from '../controllers/mail';
import { uploadReflection } from '../controllers/reflections';
import multer from 'multer';

const router = Router();

const limits = { fileSize: 1000 * 1000 * 4 }; // limit to 4mb
const storage = multer.memoryStorage();
const upload = multer({ storage, limits });

router.post('/request', requestReflections);
router.post('/upload', upload.array('image'), uploadReflection);
export default router;
