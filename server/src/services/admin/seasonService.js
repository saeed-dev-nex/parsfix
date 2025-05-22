import prisma from '../../config/db.js';
import { Role } from '@prisma/client';
import AppError from '../../utils/AppError.js';
import streamifier from 'streamifier';
import cloudinary from '../../config/cloudinary.js';
// import { uploadImageFromUrl } from './cloudinaryService.js'; // یا مسیر دیگر
// import { UploadApiResponse } from 'cloudinary';
/**
 * سرویس برای آپدیت اطلاعات پایه یک فصل
 * @param {string} seasonId - ID فصلی که آپدیت می‌شود
 * @param {object} updateData - داده‌های جدید (name, overview, airDate)
 * @param {object} user - کاربر ادمین لاگین کرده
 * @returns {Promise<object>} - فصل آپدیت شده
 */
export const updateSeasonService = async (seasonId, updateData, user) => {
  console.log(`Admin ${user.id} attempting to update season ${seasonId}`);

  // ۱. پیدا کردن فصل و سریال والد برای بررسی دسترسی
  const season = await prisma.season.findUnique({
    where: { id: seasonId },
    select: {
      id: true,
      series: { select: { id: true, addedById: true } }, // سریال والد و ادمین آن
    },
  });

  if (!season) {
    throw new AppError('فصل مورد نظر یافت نشد.', 404);
  }

  // ۲. بررسی دسترسی (بر اساس مالکیت سریال والد)
  const canUpdate =
    user.role === Role.SUPER_ADMIN ||
    (user.role === Role.ADMIN && season.series.addedById === user.id);

  if (!canUpdate) {
    throw new AppError('شما اجازه ویرایش این فصل را ندارید.', 403);
  }

  // ۳. آماده‌سازی داده‌های معتبر برای آپدیت
  const dataToUpdate = {};
  const allowedFields = ['name', 'overview', 'airDate'];

  for (const key of Object.keys(updateData)) {
    if (allowedFields.includes(key) && updateData[key] !== undefined) {
      if (key === 'airDate' && updateData.airDate) {
        try {
          dataToUpdate.airDate = new Date(updateData.airDate);
        } catch (e) {}
      } else {
        dataToUpdate[key] = updateData[key];
      }
    }
  }

  if (Object.keys(dataToUpdate).length === 0) {
    throw new AppError('هیچ داده معتبری برای آپدیت ارائه نشده است.', 400);
  }

  // ۴. آپدیت فصل در دیتابیس
  console.log(`Updating season ${seasonId} with data:`, dataToUpdate);
  try {
    const updatedSeason = await prisma.season.update({
      where: { id: seasonId },
      data: dataToUpdate,
      // می‌توانید select را برای بازگرداندن اطلاعات لازم تنظیم کنید
      select: {
        id: true,
        seasonNumber: true,
        name: true,
        overview: true,
        airDate: true,
        posterPath: true,
        episodeCount: true,
      },
    });
    console.log(`Season ${seasonId} updated successfully.`);
    return updatedSeason;
  } catch (error) {
    console.error(`Error updating season ${seasonId} in DB:`, error);
    throw new AppError('خطا در به‌روزرسانی فصل در دیتابیس.', 500);
  }
};

/**
 * سرویس برای آپدیت پوستر فصل
 * @param {string} seasonId - ID فصل
 * @param {string} userId - ID کاربر ادمین
 * @param {Role} userRole - نقش کاربر ادمین
 * @param {Express.Multer.File} fileObject - فایل عکس
 * @returns {Promise<object>} - فصل آپدیت شده با URL پوستر جدید
 */
export const updateSeasonPosterService = async (
  seasonId,
  userId,
  userRole,
  fileObject
) => {
  console.log(
    `[Update Season Poster] Attempting for Season ID: ${seasonId} by User: ${userId} (Role: ${userRole})`
  );

  // ۱. پیدا کردن فصل و سریال والد برای بررسی دسترسی و نامگذاری فایل در کلودیناری
  const season = await prisma.season.findUnique({
    where: { id: seasonId },
    select: {
      id: true,
      seasonNumber: true, // برای ساخت public_id یکتا در کلودیناری
      series: {
        // برای بررسی دسترسی و tmdbId سریال
        select: {
          id: true,
          tmdbId: true, // برای public_id کلودیناری
          addedById: true, // برای بررسی دسترسی ادمین
        },
      },
    },
  });

  if (!season || !season.series) {
    throw new AppError('فصل یا سریال والد آن برای آپدیت پوستر یافت نشد.', 404);
  }

  // ۲. بررسی دسترسی (ادمین باید مالک سریال باشد یا سوپرادمین)
  const canUpdate =
    userRole === Role.SUPER_ADMIN ||
    (userRole === Role.ADMIN && season.series.addedById === userId);

  if (!canUpdate) {
    throw new AppError('شما اجازه ویرایش پوستر این فصل را ندارید.', 403);
  }

  // ۳. تابع داخلی برای آپلود بافر به کلودیناری
  const uploadToCloudinary = (buffer) => {
    // تایپ بافر
    return new Promise((resolve, reject) => {
      const folder = 'parsflix_season_posters'; // پوشه مخصوص پوسترهای فصل
      // ساخت یک public_id یکتا برای بازنویسی عکس قبلی فصل (اگر وجود داشت)
      const public_id = `series_${season.series.tmdbId}_season_${season.seasonNumber}_poster`;

      console.log(
        `[Update Season Poster] Uploading to Cloudinary. Folder: ${folder}, Public ID: ${public_id}`
      );

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: public_id,
          overwrite: true, // اگر فایلی با همین public_id بود، بازنویسی کن
          // resource_type: 'auto' // شناسایی خودکار نوع فایل
        },
        (error, result) => {
          console.log('--- Cloudinary Season Poster Callback Executed ---');
          console.log('Cloudinary Error:', JSON.stringify(error, null, 2));
          console.log('Cloudinary Result:', JSON.stringify(result, null, 2));

          if (error) {
            return reject(
              new AppError(
                `Cloudinary Upload Error: ${error.message || 'Unknown error'}`,
                500
              )
            );
          }
          if (!result || !result.secure_url) {
            return reject(
              new AppError(
                'آپلود پوستر فصل به کلودیناری نتیجه معتبری برنگرداند.',
                500
              )
            );
          }
          resolve(result);
        }
      );

      uploadStream.on('error', (streamError) => {
        console.error(
          '!!! Cloudinary raw stream error event (Season Poster):',
          streamError
        );
        reject(
          new AppError(
            `Cloudinary Stream Error: ${
              streamError.message || 'Unknown stream error'
            }`,
            500
          )
        );
      });

      // ارسال بافر فایل به استریم کلودیناری
      streamifier.createReadStream(fileObject.buffer).pipe(uploadStream);
    });
  }; // پایان uploadToCloudinary

  // ۴. آپلود فایل جدید
  try {
    const uploadResult = await uploadToCloudinary(fileObject.buffer);
    const newImageUrl = uploadResult.secure_url;
    console.log(
      `[Update Season Poster] Season poster uploaded to Cloudinary: ${newImageUrl}`
    );

    // ۵. آپدیت فیلد posterPath در دیتابیس برای فصل مورد نظر
    const updatedSeason = await prisma.season.update({
      where: { id: seasonId },
      data: { posterPath: newImageUrl },
      select: {
        // فیلدهای لازم برای بازگشت به کلاینت
        id: true,
        seasonNumber: true,
        name: true,
        posterPath: true, // URL جدید پوستر
        overview: true,
        airDate: true,
        episodeCount: true,
        seriesId: true, // برای اینکه کلاینت بداند کدام سریال آپدیت شده
      },
    });
    console.log(
      `[Update Season Poster] Season ${seasonId} posterPath updated in DB.`
    );
    return updatedSeason;
  } catch (error) {
    console.error(
      `[Update Season Poster] Error during service execution:`,
      error
    );
    // اگر خطا از نوع AppError بود، دوباره همان را پرتاب کن
    if (error instanceof AppError) throw error;
    // برای خطاهای دیگر، یک خطای عمومی‌تر بساز
    throw new AppError(
      error.message || `خطا در فرآیند آپلود یا ذخیره پوستر فصل`,
      500
    );
  }
}; // پایان updateSeasonPosterService
