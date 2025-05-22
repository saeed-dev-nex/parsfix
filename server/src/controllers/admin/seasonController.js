import {
  updateSeasonService,
  updateSeasonPosterService,
} from '../../services/admin/seasonService.js'; // مسیر سرویس فصل
import AppError from '../../utils/AppError.js';

/**
 * کنترلر برای آپدیت اطلاعات پایه یک فصل
 */
export const updateSeasonController = async (req, res, next) => {
  console.log(
    `--- Entered updateSeasonController for ID: ${req.params.id} ---`
  );
  try {
    const seasonId = req.params.id;
    const updateData = req.body; // داده‌های جدید (ولید شده)
    const user = req.user; // از protect

    if (!seasonId) {
      throw new AppError('شناسه فصل مشخص نشده است.', 400);
    }
    if (Object.keys(updateData).length === 0) {
      throw new AppError('داده‌ای برای آپدیت ارسال نشده است.', 400);
    }

    const updatedSeason = await updateSeasonService(seasonId, updateData, user);

    res.status(200).json({
      status: 'success',
      message: 'فصل با موفقیت به‌روزرسانی شد.',
      data: { season: updatedSeason },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * کنترلر برای آپدیت پوستر فصل
 */
export const uploadSeasonPosterController = async (req, res, next) => {
  console.log(
    `--- Entered uploadSeasonPosterController for ID: ${req.params.id} ---`
  );
  try {
    const seasonId = req.params.id;
    const user = req.user;
    const file = req.file; // از multer
    if (!file) {
      throw new AppError('فایل پوستر ارسال نشده است.', 400);
    }
    if (!seasonId) {
      throw new AppError('شناسه فصل مشخص نشده است.', 400);
    }
    const updatedSeason = await updateSeasonPosterService(
      seasonId,
      user.id,
      user.role,
      file
    );
    res.status(200).json({
      status: 'success',
      message: 'پوستر فصل به‌روزرسانی شد.',
      data: { season: updatedSeason },
    });
  } catch (error) {
    next(error);
  }
};

// TODO: Add episode controllers later
