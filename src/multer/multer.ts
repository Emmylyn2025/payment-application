import multer from 'multer';
import path from 'path';
import { appError } from '../utils/error';
import fs from "fs";

const MAX_SIZE = 100 * 1024 * 1024; // 100MB

const TEMP_DIR = 'temp/';

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}


const storage = multer.diskStorage({
  destination: 'temp/',
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
  const allowedExtensions = ['.mp4', '.mpeg', '.mov', '.avi'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimeValid = allowedMimeTypes.includes(file.mimetype);
  const isExtValid = allowedExtensions.includes(ext);

  if (isMimeValid && isExtValid) {
    cb(null, true);
  } else {
    cb(new appError('Invalid file type. Only MP4, MPEG, MOV, and AVI are allowed.', 422));
  }
};

export const uploadVideo = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});