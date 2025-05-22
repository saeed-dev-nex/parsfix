import cloudinary from '../../config/cloudinary.js';
import AppError from '../../utils/AppError.js';
/**
 * Uploads an image from TMDB to Cloudinary and returns the URL.
 * @param {string} imageUrl - The URL of the image to upload.
 * @param {object} options - Options for the upload.
 * @return {Promise<string>} - The URL of the uploaded image.
 */
export const uploadImageFromUrl = async (imageUrl, options = {}) => {
  if (!imageUrl) return null;
  console.log(
    `Uploading image to Cloudinary from URL: ${imageUrl.substring(0, 50)}...`
  );
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'parsflix/uploads',
    });
    console.log(`Successfully uploaded to Cloudinary: ${result.secure_url}`);
    return result;
  } catch (error) {
    console.error(
      `Failed to upload image from URL ${imageUrl} to Cloudinary:`,
      error
    );
    return null;
  }
};
