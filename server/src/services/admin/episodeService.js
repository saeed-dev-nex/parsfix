import prisma from '../../config/db.js';
import { Role } from '@prisma/client';
import AppError from '../../utils/AppError.js';
import cloudinary from '../../config/cloudinary.js';
import streamifier from 'streamifier';

/**
 * سرویس برای آپدیت اطلاعات پایه یک قسمت
 * @param {string} episodeId - ID قسمتی که آپدیت می‌شود
 * @param {object} updateData - داده‌های جدید (title, overview, airDate, runtime)
 * @param {object} user - کاربر ادمین لاگین کرده
 * @returns {Promise<object>} - قسمت آپدیت شده
 */
export const updateEpisodeService = async (episodeId, updateData, user) => {
  console.log(`Admin ${user.id} attempting to update episode ${episodeId}`);

  // ۱. پیدا کردن قسمت و سریال/فصل والد برای بررسی دسترسی
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: {
      id: true,
      season: { select: { series: { select: { id: true, addedById: true } } } }, // برای چک کردن مالکیت سریال
    },
  });
  if (!episode || !episode.season?.series) {
    throw new AppError('قسمت یا سریال والد آن یافت نشد.', 404);
  }

  // ۲. بررسی دسترسی (بر اساس مالکیت سریال والد)
  const canUpdate =
    user.role === Role.SUPER_ADMIN ||
    (user.role === Role.ADMIN && episode.season.series.addedById === user.id);
  if (!canUpdate) {
    throw new AppError('شما اجازه ویرایش این قسمت را ندارید.', 403);
  }

  // ۳. آماده‌سازی داده‌های معتبر
  const dataToUpdate = {};
  const allowedFields = ['title', 'overview', 'airDate', 'runtime'];
  for (const key of Object.keys(updateData)) {
    if (allowedFields.includes(key) && updateData[key] !== undefined) {
      if (key === 'airDate') {
        dataToUpdate[key] = updateData[key] ? new Date(updateData[key]) : null;
      } else if (key === 'runtime' && updateData[key]) {
        dataToUpdate[key] = parseInt(updateData[key], 10) || null;
      } else {
        dataToUpdate[key] = updateData[key];
      }
    }
  }
  if (Object.keys(dataToUpdate).length === 0) {
    throw new AppError('داده معتبری برای آپدیت نیست.', 400);
  }

  // ۴. آپدیت قسمت
  console.log(`Updating episode ${episodeId} with data:`, dataToUpdate);
  try {
    const updatedEpisode = await prisma.episode.update({
      where: { id: episodeId },
      data: dataToUpdate,
      select: {
        id: true,
        episodeNumber: true,
        seasonNumber: true,
        title: true,
        overview: true,
        airDate: true,
        runtime: true,
        stillPath: true,
      },
    });
    console.log(`Episode ${episodeId} updated successfully.`);
    return updatedEpisode;
  } catch (error) {
    console.error(`Error updating episode ${episodeId}:`, error);
    throw new AppError('خطا در به‌روزرسانی قسمت.', 500);
  }
};

/**
 * سرویس برای آپدیت عکس صحنه (Still) قسمت
 * @param {string} episodeId - ID قسمت
 * @param {string} userId - ID کاربر ادمین
 * @param {Role} userRole - نقش کاربر ادمین
 * @param {Express.Multer.File} fileObject - فایل عکس
 * @returns {Promise<object>} - قسمت آپدیت شده با URL عکس جدید
 */
export const updateEpisodeStillService = async (
  episodeId,
  userId,
  userRole,
  fileObject
) => {
  console.log(
    `[Update Episode Still] Attempting for Episode ID: ${episodeId} by User: ${userId} (Role: ${userRole})`
  );

  // ۱. پیدا کردن قسمت، فصل والد و سریال والد برای بررسی دسترسی و نامگذاری فایل در کلودیناری
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: {
      id: true,
      episodeNumber: true, // برای ساخت public_id یکتا
      seasonNumber: true, // برای ساخت public_id یکتا
      season: {
        // برای گرفتن ID سریال
        select: {
          id: true,
          series: {
            // برای بررسی دسترسی و tmdbId سریال
            select: {
              id: true,
              tmdbId: true, // برای public_id کلودیناری
              addedById: true, // برای بررسی دسترسی ادمین
            },
          },
        },
      },
    },
  });

  if (!episode || !episode.season?.series) {
    throw new AppError(
      'قسمت یا اطلاعات والد آن (فصل/سریال) برای آپدیت عکس یافت نشد.',
      404
    );
  }

  // ۲. بررسی دسترسی (ادمین باید مالک سریال باشد یا سوپرادمین)
  const canUpdate =
    userRole === Role.SUPER_ADMIN ||
    (userRole === Role.ADMIN && episode.season.series.addedById === userId);

  if (!canUpdate) {
    throw new AppError('شما اجازه ویرایش عکس این قسمت را ندارید.', 403);
  }

  // ۳. تابع داخلی برای آپلود بافر به کلودیناری
  const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
      const folder = 'parsflix_episode_stills'; // پوشه مخصوص عکس‌های صحنه قسمت‌ها
      // ساخت یک public_id یکتا برای بازنویسی عکس قبلی قسمت (اگر وجود داشت)
      const public_id = `series_${episode.season.series.tmdbId}_s${episode.seasonNumber}_e${episode.episodeNumber}_still`;

      console.log(
        `[Update Episode Still] Uploading to Cloudinary. Folder: ${folder}, Public ID: ${public_id}`
      );

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: public_id,
          overwrite: true, // اگر فایلی با همین public_id بود، بازنویسی کن
          // resource_type: 'auto' // شناسایی خودکار نوع فایل
        },
        (error, result) => {
          console.log('--- Cloudinary Episode Still Callback Executed ---');
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
                'آپلود عکس صحنه به کلودیناری نتیجه معتبری برنگرداند.',
                500
              )
            );
          }
          resolve(result);
        }
      );

      uploadStream.on('error', (streamError) => {
        console.error(
          '!!! Cloudinary raw stream error event (Episode Still):',
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
    const newImageUrl = uploadResult.secure_url; // URL امن عکس از کلودیناری
    console.log(
      `[Update Episode Still] Still image uploaded to Cloudinary: ${newImageUrl}`
    );

    // ۵. آپدیت فیلد stillPath در دیتابیس برای قسمت مورد نظر
    const updatedEpisode = await prisma.episode.update({
      where: { id: episodeId },
      data: { stillPath: newImageUrl }, // فقط فیلد عکس آپدیت می‌شود
      select: {
        // فیلدهای لازم برای بازگشت به کلاینت
        id: true,
        episodeNumber: true,
        seasonNumber: true,
        title: true,
        overview: true,
        airDate: true,
        runtime: true,
        stillPath: true, // URL جدید عکس
        seasonId: true, // برای اینکه کلاینت بداند کدام فصل آپدیت شده
      },
    });
    console.log(
      `[Update Episode Still] Episode ${episodeId} stillPath updated in DB.`
    );
    return updatedEpisode;
  } catch (error) {
    console.error(
      `[Update Episode Still] Error during service execution:`,
      error
    );
    // اگر خطا از نوع AppError بود، دوباره همان را پرتاب کن
    if (error instanceof AppError) throw error;
    // برای خطاهای دیگر، یک خطای عمومی‌تر بساز
    throw new AppError(
      error.message || `خطا در فرآیند آپلود یا ذخیره عکس صحنه قسمت`,
      500
    );
  }
}; // پایان updateEpisodeStillService
