import prisma from '../../config/db.js';
// مطمئن شوید enum های وضعیت را ایمپورت کرده‌اید
import { MovieStatus, SeriesStatus } from '@prisma/client';

/**
 * سرویس برای دریافت آیتم‌های Hero Slider (فقط موارد منتشر شده و عمومی)
 */
export const getHeroSliderItemsService = async () => {
  console.log('[ContentService] Fetching public hero slider items...');
  try {
    const moviesPromise = prisma.movie.findMany({
      where: {
        // --->>> فیلتر وضعیت فیلم <<<---
        status: { in: [MovieStatus.PUBLISHED, MovieStatus.ARCHIVED] },
        // ---------------------------
        posterPath: { not: null },
        backdropPath: { not: null },
      },
      orderBy: { releaseDate: 'desc' },
      take: 3,
      select: {
        /* ... فیلدهای لازم برای MediaItem ... */ id: true,
        title: true,
        description: true,
        posterPath: true,
        backdropPath: true,
        releaseDate: true,
        tagline: true /* genres, imdbRating ... */,
        // اضافه کردن یک فیلد نوع به صورت دستی لازم است اگر در مدل نیست
      },
    });

    const seriesPromise = prisma.series.findMany({
      where: {
        // --->>> فیلتر وضعیت سریال <<<---
        status: {
          in: [
            SeriesStatus.PUBLISHED,
            SeriesStatus.ENDED,
            SeriesStatus.CANCELED,
            SeriesStatus.ARCHIVED,
          ],
        },
        // -----------------------------
        posterPath: { not: null },
        backdropPath: { not: null },
      },
      orderBy: { firstAirDate: 'desc' },
      take: 2,
      select: {
        /* ... فیلدهای لازم برای MediaItem ... */ id: true,
        title: true,
        description: true,
        posterPath: true,
        backdropPath: true,
        firstAirDate: true,
        tagline: true,
        numberOfSeasons: true,
        // genres ...
      },
    });

    const [movies, series] = await Promise.all([moviesPromise, seriesPromise]);

    // تبدیل و ترکیب نتایج (کد قبلی)
    const heroItems = [
      ...movies.map((movie) => ({
        ...movie,
        type: 'movie' /* ...سایر مپینگ‌ها... */,
      })),
      ...series.map((s) => ({ ...s, type: 'show' /* ...سایر مپینگ‌ها... */ })),
    ];
    // ... (مرتب‌سازی و slice نهایی) ...

    console.log(
      `[ContentService] Found ${heroItems.length} public hero items.`
    );
    return heroItems.slice(0, 5);
  } catch (error) {
    console.error('[ContentService] Error fetching public hero items:', error);
    throw new Error('خطا در واکشی آیتم‌های اسلایدر عمومی.');
  }
};
