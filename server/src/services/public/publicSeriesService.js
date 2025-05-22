import prisma from '../../config/db.js';
import { SeriesStatus } from '@prisma/client';
import AppError from '../../utils/AppError.js';

/**
 * Service for get list of series
 * @param {object} options - Options object {page, limit, sortBy, sortOrder, genreId, search}
 * @returns {Promise<object>} - Promise that resolves to an array of series objects
 */

/**
 * سرویس برای دریافت لیست سریال‌ها برای نمایش عمومی
 * @param {object} options - آپشن‌های کوئری (page, limit, sortBy, sortOrder)
 * @returns {Promise<object>} - شامل لیست سریال‌ها و اطلاعات صفحه‌بندی
 * @throws {AppError} - اگر خطای دیگری رخ دهد
 */
export const getPublicSeriesService = async ({
  page = 1,
  limit = 10,
  sortBy = 'pupularity',
  sortOrder = 'desc',
  // genreId = null,
  // search = null
}) => {
  console.log(
    `[Public Service] Fetching series list with options:, ${
      (page, limit, sortBy, sortOrder)
    }`
  );
  try {
    const skip = (page - 1) * limit;
    const take = parseInt(limit, 10);
    if (isNaN(take) || take <= 0) {
      throw new AppError('مقدار limit نامعتبر است.', 400);
    }

    // فیلدهای مجاز مرتب‌سازی برای سریال
    const allowedSortFields = [
      'title',
      'firstAirDate',
      'lastAirDate',
      'popularity',
      'status',
      'tmdbId',
      'imdbRating',
      'rottenTomatoesScore',
    ];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : 'createdAt';
    const safeSortOrder = ['asc', 'desc'].includes(sortOrder)
      ? sortOrder
      : 'desc';
    let whereCondition = {
      status: {
        in: [SeriesStatus.PUBLISHED, SeriesStatus.ENDED, SeriesStatus.CANCELED],
      },
      posterPath: { not: null },
    };
    // TODO: Add genreFilter or search logic to whereCondition if needed

    const series = await prisma.series.findMany({
      where: whereCondition,
      skip: skip,
      take: take,
      orderBy: { [safeSortBy]: safeSortOrder },
      select: {
        // فیلدهای لازم برای کارت‌های نمایش عمومی
        id: true,
        title: true,
        description: true, // خلاصه برای کارت
        posterPath: true,
        // slug: true, // اگر slug اضافه کردید
        numberOfSeasons: true,
        firstAirDate: true,
        status: true, // ممکن است برای نمایش وضعیت (مثلا "پایان یافته") لازم باشد
        genres: { select: { id: true, name: true } },
        // _count: { select: { ratings: true } } // اگر می‌خواهید تعداد امتیاز کاربران را نشان دهید
        // imdbRating: true // اگر امتیاز IMDb را هم نشان می‌دهید
      },
    });
    // تعداد کل سریال‌های عمومی
    const totalSeries = await prisma.series.count({ where: whereCondition });
    const totalPages = Math.ceil(totalSeries / take);

    console.log(
      `[Public Service] Found ${series.length} public series (Total: ${totalSeries})`
    );
    return {
      series,
      totalSeries,
      totalPages,
      currentPage: parseInt(page, 10),
      limit: take,
    };
  } catch (error) {
    console.error('[Public Service] Error fetching public series list:', error);
    throw new AppError('خطا در واکشی لیست سریال‌ها برای نمایش عمومی.', 500);
  }
};
/**
 * سرویس برای دریافت جزئیات کامل یک سریال عمومی بر اساس ID
 * @param {string} seriesIdOrTmdbId - ID سریال
 * @returns {Promise<object>} - آبجکت کامل سریال با روابط
 * @throws {AppError} - اگر سریال یافت نشد یا خطای دیگری رخ دهد
 */
export const getPublicSeriesDetailsService = async (id) => {
  console.log(`WorkSpacing details for ID: ${id}`);
  try {
    const whereClause = isNaN(parseInt(id, 10))
      ? { id: id }
      : { tmdbId: parseInt(id, 10) };

    const series = await prisma.series.findUnique({
      where: whereClause,
      select: {
        id: true,
        tmdbId: true,
        title: true,
        originalTitle: true,
        tagline: true,
        description: true,
        firstAirDate: true,
        lastAirDate: true,
        status: true,
        tmdbStatus: true,
        type: true,
        originalLanguage: true,
        popularity: true,
        numberOfSeasons: true,
        numberOfEpisodes: true,
        homepage: true,
        adult: true,
        posterPath: true,
        backdropPath: true,
        imdbRating: true,
        rottenTomatoesScore: true,
        genres: { select: { id: true, name: true, imageUrl: true } },
        seasons: {
          where: {
            airDate: { lte: new Date() },
            seasonNumber: { not: 0 }, // عدم نمایش فصل صفر (Specials) در حالت پیش‌فرض؟
          },
          select: {
            id: true,
            seasonNumber: true,
            name: true,
            overview: true,
            airDate: true,
            posterPath: true,
            episodeCount: true,
            episodes: {
              where: {
                airDate: { lte: new Date() }, // فقط قسمت‌هایی که تاریخ پخششان گذشته یا امروز است
              },
              orderBy: { episodeNumber: 'asc' },
              select: {
                id: true,
                episodeNumber: true,
                title: true,
                overview: true,
                airDate: true,
                runtime: true,
                stillPath: true,
                seasonNumber: true,
              },
            },
          },
          orderBy: { seasonNumber: 'asc' },
        },
        credits: {
          // فقط نقش‌های اصلی و تعداد محدود؟
          where: {
            OR: [{ role: CreditType.ACTOR }, { role: CreditType.DIRECTOR }],
          },
          take: 15, // مثلا ۱۵ عامل اصلی
          select: {
            role: true,
            characterName: true,
            person: { select: { id: true, name: true, imageUrl: true } },
          },
          // orderBy: { person: { popularity: 'desc' } } // یا ترتیب خاص
        },
        // ratings: { select: { score: true, user: {select: {name: true}} } }, // امتیازات کاربران سایت
        // comments: { select: { text: true, user: {select: {name: true}}, createdAt: true } } // نظرات
      },
    });
    if (!series) {
      throw new AppError(`سریالی با شناسه '${id}' یافت نشد.`, 404);
    }

    // بررسی وضعیت سریال برای نمایش عمومی
    const publiclyVisibleStatuses = [
      SeriesStatus.PUBLISHED,
      SeriesStatus.ENDED,
      SeriesStatus.CANCELED,
      SeriesStatus.ARCHIVED,
    ];
    if (!publiclyVisibleStatuses.includes(series.status)) {
      throw new AppError(
        'این سریال در حال حاضر برای نمایش عمومی در دسترس نیست.',
        403
      ); // یا 404
    }

    console.log(`[Public Service] Public series details found for '${id}'`);
    return series;
  } catch (error) {
    console.error(
      `[Public Service] Error fetching public series details for '${id}':`,
      error
    );
    if (error instanceof AppError) throw error;
    throw new AppError('خطا در واکشی جزئیات سریال برای نمایش عمومی.', 500);
  }
};
