import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const carpetaImagenes = path.join(__dirname, '../../public/img');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const carpeta = file.fieldname === 'avatar' ? 'users' : 'pets';
    cb(null, path.join(carpetaImagenes, carpeta));
  },


  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const soloImagenes = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
};

export const upload = multer({
  storage,
  fileFilter: soloImagenes,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
