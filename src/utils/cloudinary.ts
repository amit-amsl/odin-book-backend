import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import { createReadStream } from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFileToCloudinary = (
  buffer: Buffer,
  options: UploadApiOptions = {}
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error(error);
          return reject(error);
        } else {
          resolve(result);
        }
      }
    );
    createReadStream(buffer).pipe(uploadStream);
  });
};

export { cloudinary, uploadFileToCloudinary };
