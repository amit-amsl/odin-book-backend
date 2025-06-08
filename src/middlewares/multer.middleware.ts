import multer from 'multer';

const uploadImageFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3_000_000 },
  fileFilter: (_req, file, cb) => {
    const fileWhitelist = ['image/png', 'image/jpeg', 'image/jpg'];

    if (!fileWhitelist.includes(file.mimetype)) {
      const err = new Error('Not an image, only image files are allowed!');
      cb(err);
      return;
    }
    cb(null, true);
  },
});

export { uploadImageFile };
