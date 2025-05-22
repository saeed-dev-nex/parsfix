import {
  updateUserProfileService,
  uploadProfilePictureService,
} from '../../services/auth/userService.js'; // سرویس را بعدا می‌سازیم
import AppError from '../../utils/AppError.js';

/**========================================================**/
/**        controller for get user profile data            **/
/**========================================================**/

export const getUserProfile = async (req, res, next) => {
  try {
    // req.user add with protection middleware in authMiddleware
    const {
      password,
      activationToken,
      activationTokenExpires,
      activationFailedAttempts,
      ...safeUser
    } = req.user;
    res.status(200).json({ status: 'success', data: { user: safeUser } });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfileController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    const updatedUser = await updateUserProfileService(userId, {
      name: updateData.name,
      dateOfBirth: updateData.dateOfBirth,
      gender: updateData.gender,
    });

    res.status(200).json({
      status: 'success',
      message: 'پروفایل با موفقیت به‌روزرسانی شد.',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

/**======================================================**/
/**       controller for upload profile picture          **/
/**======================================================**/

export const uploadProfilePictureController = async (req, res, next) => {
  console.log('--- updateProfilePictureController ---');
  console.log('req.file:', req.file); // آیا multer فایل را تشخیص داده؟
  console.log('req.body:', req.body); // آیا فیلدهای دیگری هم هست؟
  try {
    // 1. check user upload file with multer
    console.log('--- Entered updateProfilePictureController ---'); // <-- لاگ ۱
    if (!req.file) {
      console.log('!!! No file received by controller !!!'); // <-- لاگ ۲
      return next(new AppError('هیچ فایلی برای آپلود انتخاب نشده است', 400));
    }
    console.log(
      'Controller received file:',
      req.file.originalname,
      req.file.mimetype,
      req.file.size
    ); // <-- لاگ ۳
    // 2. recive user id from protect middleware
    const userId = req.user.id;
    console.log(`Calling uploadProfilePictureService for user ${userId}...`); // <-- لاگ ۴
    // 3. send file to cloudinary service
    const updatedUser = await uploadProfilePictureService(userId, req.file);
    console.log('uploadProfilePictureService returned successfully.'); // <-- لاگ ۵
    // 4. send response to client include image url
    res.status(200).json({
      status: 'success',
      message: 'تصویر پروفایل با موفقیت آپلود شد.',
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('!!! Error in updateProfilePictureController:', error); // <-- لاگ ۶
    next(error);
  }
};
