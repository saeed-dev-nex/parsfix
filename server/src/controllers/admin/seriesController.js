import {
  createSeriesService,
  deleteSeriesService,
  getAllSeriesService,
  getSeriesByIdService,
  updateSeriesImageService,
  updateSeriesService,
} from '../../services/admin/seriesService.js'; // ایمپورت سرویس سریال
import { searchTmdbSeries } from '../../services/admin/tmdbService.js';

/**
 * کنترلر برای دریافت لیست سریال‌ها
 */
export const getAllSeriesController = async (req, res, next) => {
  console.log('--- Entered getAllSeriesController ---');
  try {
    const { page, limit, sortBy, sortOrder /*, filter params? */ } = req.query;
    const user = req.user; // کاربر ادمین از protect

    const result = await getAllSeriesService(user, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy: sortBy,
      sortOrder: sortOrder,
      // pass other filters like status or genre later
    });

    res.status(200).json({
      status: 'success',
      message: 'لیست سریال‌ها با موفقیت دریافت شد.',
      data: result, // شامل series و اطلاعات pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * کنترلر برای جستجوی سریال در TMDB
 */
export const searchTmdbSeriesController = async (req, res, next) => {
  console.log('--- Entered searchTmdbSeriesController ---');
  try {
    const { query, page } = req.query;
    if (!query) {
      const error = new Error('پارامتر جستجو (query) الزامی است.');
      error.statusCode = 400;
      return next(error);
    }
    const results = await searchTmdbSeries(query, parseInt(page || '1', 10));
    res.status(200).json({ status: 'success', data: results });
  } catch (error) {
    next(error);
  }
};

/**
 * کنترلر برای دریافت جزئیات یک سریال بر اساس ID
 */
export const getSeriesByIdController = async (req, res, next) => {
  console.log(
    `--- Entered getSeriesByIdController for ID: ${req.params.id} ---`
  );
  try {
    const seriesId = req.params.id;
    if (!seriesId) {
      throw new AppError('شناسه سریال مشخص نشده است.', 400);
    }
    // فراخوانی سرویس برای گرفتن جزئیات
    const series = await getSeriesByIdService(seriesId);

    // ارسال پاسخ موفقیت آمیز
    res.status(200).json({
      status: 'success',
      data: { series }, // ارسال آبجکت کامل سریال
    });
  } catch (error) {
    next(error); // ارسال خطا به errorHandler
  }
};

/**
 * کنترلر برای ایجاد سریال جدید با استفاده از TMDB ID
 */
export const createSeriesController = async (req, res, next) => {
  console.log('--- Entered createSeriesController ---');
  try {
    // داده‌های ورودی (tmdbId, status?) توسط validate(createSeriesSchema) تایید شده‌اند
    const inputData = req.body;
    console.log('Received validated input data for create series:', inputData);

    const userId = req.user?.id; // ID ادمین از protect middleware
    if (!userId) {
      throw new Error('خطای داخلی: شناسه کاربر ادمین یافت نشد.');
    }

    // فراخوانی سرویس اصلی ایجاد سریال
    console.log(
      `Calling createSeriesService with TMDB ID: ${inputData.tmdbId} by User ID: ${userId}`
    );
    const newSeries = await createSeriesService(inputData, userId);
    console.log('createSeriesService finished successfully.');

    // ارسال پاسخ موفقیت آمیز 201 Created
    res.status(201).json({
      status: 'success',
      message: 'سریال با موفقیت ایجاد و به دیتابیس اضافه شد.',
      data: {
        series: newSeries, // ارسال سریال کامل ایجاد شده با جزئیات
      },
    });
  } catch (error) {
    console.error('!!! Error in createSeriesController:', error);
    next(error); // ارسال خطا به errorHandler
  }
};

/**
 * کنترلر برای حذف یک سریال
 */
export const deleteSeriesController = async (req, res, next) => {
  console.log(
    `--- Entered deleteSeriesController for ID: ${req.params.id} ---`
  );
  try {
    const seriesId = req.params.id;
    const user = req.user; // از protect middleware

    if (!seriesId) {
      throw new AppError('شناسه سریال برای حذف مشخص نشده است.', 400);
    }

    await deleteSeriesService(seriesId, user);

    console.log(
      `Successfully processed delete request for series ${seriesId}. Sending 204.`
    );
    res.status(204).json({ status: 'success', data: null }); // پاسخ 204 No Content
  } catch (error) {
    next(error);
  }
};

/**
 * کنترلر برای آپدیت یک سریال
 */
export const updateSeriesController = async (req, res, next) => {
  console.log(
    `--- Entered updateSeriesController for ID: ${req.params.id} ---`
  );
  try {
    const seriesId = req.params.id;
    const updateData = req.body; // داده‌های جدید از بدنه (ولید شده)
    const user = req.user;

    if (!seriesId) {
      throw new AppError('شناسه سریال مشخص نشده است.', 400);
    }
    if (Object.keys(updateData).length === 0) {
      throw new AppError('داده‌ای برای آپدیت ارسال نشده است.', 400);
    }

    const updatedSeries = await updateSeriesService(seriesId, updateData, user);

    res.status(200).json({
      status: 'success',
      message: 'سریال با موفقیت به‌روزرسانی شد.',
      data: { series: updatedSeries },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadSeriesPosterController = async (req, res, next) => {
  console.log(
    `--- Entered uploadSeriesPosterController for ID: ${req.params.id} ---`
  );
  try {
    const seriesId = req.params.id;
    const user = req.user;
    const file = req.file; // از multer

    if (!file) {
      throw new AppError('فایل پوستر ارسال نشده است.', 400);
    }
    if (!seriesId) {
      throw new AppError('شناسه سریال مشخص نشده است.', 400);
    }

    const updatedSeries = await updateSeriesImageService(
      seriesId,
      user.id,
      user.role,
      file,
      'poster'
    );

    res.status(200).json({
      status: 'success',
      message: 'پوستر سریال به‌روزرسانی شد.',
      data: { series: updatedSeries }, // سریال آپدیت شده را برگردان
    });
  } catch (error) {
    next(error);
  }
};

/**
 * کنترلر برای آپلود/جایگزینی عکس بک‌دراپ سریال
 */
export const uploadSeriesBackdropController = async (req, res, next) => {
  console.log(
    `--- Entered uploadSeriesBackdropController for ID: ${req.params.id} ---`
  );
  try {
    const seriesId = req.params.id;
    const user = req.user;
    const file = req.file;

    if (!file) {
      throw new AppError('فایل بک‌دراپ ارسال نشده است.', 400);
    }
    if (!seriesId) {
      throw new AppError('شناسه سریال مشخص نشده است.', 400);
    }

    const updatedSeries = await updateSeriesImageService(
      seriesId,
      user.id,
      user.role,
      file,
      'backdrop'
    );

    res.status(200).json({
      status: 'success',
      message: 'بک‌دراپ سریال به‌روزرسانی شد.',
      data: { series: updatedSeries },
    });
  } catch (error) {
    next(error);
  }
};
