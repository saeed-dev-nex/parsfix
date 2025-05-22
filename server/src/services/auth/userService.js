import prisma from '../../config/db.js';
import cloudinary from '../../config/cloudinary.js';
import streamifier from 'streamifier';
import AppError from '../../utils/AppError.js';

/**
 * Service for update user profile data
 * @param {string} userId -ID of current user want update profile
 * @param {object} data - New data for update profile (only allowed filed like name)
 * @returns {Promise<object>} - an Object with user profile data and no sensitive data like password
 */
export const updateUserProfileService = async (userId, data) => {
  try {
    // only allow update name, dateOfBirth, gender, profilePictureUrl
    const allowedUpdates = {
      name: data.name,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      gender: data.gender,
      // profilePictureUrl: data.profilePictureUrl, // for pic
    };

    // Remove undefined fields from allowedUpdates for not update - not empty after update
    Object.keys(allowedUpdates).forEach(
      (key) => allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    if (Object.keys(allowedUpdates).length === 0) {
      throw new AppError('هیچ داده معتبری برای آپدیت ارائه نشده است.', 400); // یا کد 400
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: allowedUpdates,
      // select safe filed for return
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profilePictureUrl: true,
        isActivated: true,
        createdAt: true,
        dateOfBirth: true,
        gender: true,
      },
    });
    return updatedUser;
  } catch (error) {
    console.error('Error updating user profile:', error);
    // can check prisma for special Errors
    throw new AppError('خطا در به‌روزرسانی پروفایل در دیتابیس.', 500);
  }
};

/**
 * Service for upload user profile picture in cloudinary
 * @param {string} userId -ID of current user want upload profile picture
 * @param {object} fileObject - multer file object receive from req.file
 * @returns {Promise<object>} - an Object with user profile data and no sensitive data like password
 */

export const uploadProfilePictureService = async (userId, fileObject) => {
  console.log(`--- Entered uploadProfilePictureService for user ${userId} ---`);

  // Define the promise wrapper function
  const uploadToCloudinary = (buffer) => {
    // Add buffer type and return type
    return new Promise((resolve, reject) => {
      console.log('Starting Cloudinary upload stream...');

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'parsflix/profiles',
          overwrite: true,
          // resource_type: 'auto' // در صورت نیاز
        },
        (error, result) => {
          // <<< --- فقط به این callback اتکا می‌کنیم --- <<<
          console.log('--- Cloudinary Callback Executed ---');
          console.log(
            'Cloudinary Callback - Error:',
            JSON.stringify(error, null, 2)
          );
          console.log(
            'Cloudinary Callback - Result:',
            JSON.stringify(result, null, 2)
          );

          // 1. اول خطا را بررسی کن
          if (error) {
            console.error(
              'Rejecting promise due to error received in callback:',
              error
            );
            return reject(
              new Error(
                `Cloudinary Upload Error: ${error.message || 'Unknown error'}`
              )
            );
          }
          // 2. اگر خطا نبود، نتیجه را بررسی کن (مخصوصا secure_url)
          if (!result || !result.secure_url) {
            console.error(
              'Rejecting promise due to invalid result (no secure_url) received in callback.'
            );
            return reject(
              new Error(
                'آپلود کلودیناری نتیجه معتبر یا secure_url را برنگرداند.'
              )
            );
          }
          // 3. اگر خطا نبود و نتیجه معتبر بود -> موفقیت
          console.log('Callback received valid result. Resolving promise.');
          resolve(result); // <<< --- مستقیما Promise را Resolve کن --- <<<
        }
      ); // <<< --- پایان Callback --- <<<

      // همچنین به خطاهای خود استریم گوش بده
      uploadStream.on('error', (streamError) => {
        console.error('!!! Cloudinary raw stream error event:', streamError);
        reject(
          new Error(
            `Cloudinary Stream Error: ${
              streamError.message || 'Unknown stream error'
            }`
          )
        );
      });

      // ارسال بافر به استریم
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }; // پایان uploadToCloudinary

  try {
    console.log('Attempting await uploadToCloudinary...');
    const uploadResult = await uploadToCloudinary(fileObject.buffer); // منتظر نتیجه Promise می‌مانیم
    console.log(
      'Finished await uploadToCloudinary. Result received:',
      uploadResult
    );

    // بررسی مجدد نتیجه برای اطمینان (اگرچه منطق Promise باید درست باشد)
    if (!uploadResult || !uploadResult.secure_url) {
      throw new Error('نتیجه آپلود کلودیناری پس از انتظار نامعتبر بود.');
    }

    const newImageUrl = uploadResult.secure_url;
    console.log(
      `File uploaded successfully to Cloudinary, URL: ${newImageUrl}`
    );

    console.log('Attempting to update user profilePictureUrl in DB...');
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePictureUrl: newImageUrl },
      select: {
        // فیلدهای لازم برای بازگشت به کلاینت
        id: true,
        email: true,
        name: true,
        role: true,
        profilePictureUrl: true,
        isActivated: true,
        createdAt: true,
        dateOfBirth: true,
        gender: true,
      },
    });
    console.log('User profilePictureUrl updated in DB.');

    return updatedUser;
  } catch (error) {
    console.error(
      '!!! Error within uploadProfilePictureService try/catch:',
      error
    );
    // خطای دریافتی (چه از کلودیناری چه از Prisma) را دوباره پرتاب کن
    throw error;
    // می‌توانید خطای عمومی‌تری برگردانید:
    // throw new Error("خطا در هنگام به‌روزرسانی عکس پروفایل.");
  }
};
