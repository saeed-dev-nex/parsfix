import {
  updateEpisodeService,
  updateEpisodeStillService,
} from '../../services/admin/episodeService.js';
import AppError from '../../utils/AppError.js';

/**
 * کنترلر برای آپدیت اطلاعات پایه یک قسمت
 */
export const updateEpisodeController = async (req, res, next) => {
  console.log(
    `--- Entered updateEpisodeController for ID: ${req.params.id} ---`
  );
  try {
    const episodeId = req.params.id;
    const updateData = req.body;
    const user = req.user;
    if (!episodeId) {
      throw new AppError('شناسه قسمت مشخص نشده است.', 400);
    }
    if (Object.keys(updateData).length === 0) {
      throw new AppError('داده‌ای برای آپدیت نیست.', 400);
    }
    const updatedEpisode = await updateEpisodeService(
      episodeId,
      updateData,
      user
    );
    res.status(200).json({
      status: 'success',
      message: 'قسمت به‌روزرسانی شد.',
      data: { episode: updatedEpisode },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * کنترلر برای آپدیت عکس صحنه (Still) قسمت
 */
export const uploadEpisodeStillController = async (req, res, next) => {
  console.log(
    `--- Entered uploadEpisodeStillController for ID: ${req.params.id} ---`
  );
  try {
    const episodeId = req.params.id;
    const user = req.user;
    const file = req.file; // از multer
    if (!file) {
      throw new AppError('فایل عکس صحنه ارسال نشده است.', 400);
    }
    if (!episodeId) {
      throw new AppError('شناسه قسمت مشخص نشده است.', 400);
    }
    const updatedEpisode = await updateEpisodeStillService(
      episodeId,
      user.id,
      user.role,
      file
    );
    res.status(200).json({
      status: 'success',
      message: 'عکس صحنه قسمت به‌روزرسانی شد.',
      data: { episode: updatedEpisode },
    });
  } catch (error) {
    next(error);
  }
};
