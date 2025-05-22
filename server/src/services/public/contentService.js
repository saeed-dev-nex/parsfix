import prisma from '../../config/db.js';
import { MovieStatus, SeriesStatus } from '@prisma/client';
import AppError from '../../utils/AppError.js';
/**
 * Convert Movie/Episode to MediaItem of client side
 * @param {*} item
 * @param {*} type
 */
const mapToMediaItem = (item, type) => {
  if (!item) return null;
  const description = item.description || item.overview || '';
  const baseData = {
    id: item.id,
    tmdbId: item.tmdbId,
    title: item.title || item.name, // سریال‌ها name دارند
    originalTitle: item.originalTitle || item.original_name,
    description: description
      ? description.length > 150
        ? description.substring(0, 147) + '...'
        : description
      : '',
    posterPath: item.posterPath,
    backdropPath: item.backdropPath,
    genres: item.genres?.map((g) => g.name) || [], // assume genres includes {name: string}[]
    status: item.status, // Your internal status
    type: type,
    // These items come from TMDB or other calculations and may be in the initial select
    rating: item.imdbRating
      ? `${item.imdbRating} IMDb`
      : item.vote_average
      ? `${item.vote_average}/10 TMDB`
      : null,
    duration:
      type === 'movie'
        ? item.runtime
          ? `${item.runtime} دقیقه`
          : null
        : item.numberOfSeasons
        ? `${item.numberOfSeasons} فصل`
        : null,
    releaseYear: item.releaseDate
      ? new Date(item.releaseDate).getFullYear()
      : item.firstAirDate
      ? new Date(item.firstAirDate).getFullYear()
      : null,
    ageRating: item.adult ? '18+' : item.adult === false ? 'همه سنین' : null, // مثال ساده
    // These fields need special fields in the model
    // or use existing fields like title and tagline.
    heroSubtitle: item.tagline,
    heroTagline: item.tagline, // or another field
    imdbRating: item.imdbRating,
  };
  return baseData;
};

/**
 * Service to get public hero slider items (only published and public)
 *  This service reads movie and series items from the database and returns
 * them as MediaItem for the client.
 *  No input
 *  @returns {Promise<MediaItem[]>}
 */
export const getHeroSliderItemsService = async () => {
  console.log('[ContentService] Fetching hero slider items...');
  try {
    const moviesPromise = prisma.movie.findMany({
      where: {
        status: { in: [MovieStatus.PUBLISHED, MovieStatus.ARCHIVED] },
        posterPath: { not: null },
        backdropPath: { not: null },
      },
      orderBy: { popularity: 'desc' }, // or releaseDate
      take: 3,
      select: {
        id: true,
        tmdbId: true,
        title: true,
        description: true,
        posterPath: true,
        backdropPath: true,
        releaseDate: true,
        runtime: true,
        tagline: true,
        genres: { select: { name: true } } /*, imdbRating, adult */,
        imdbRating: true,
      },
    });
    const seriesPromise = prisma.series.findMany({
      where: {
        status: { in: [SeriesStatus.PUBLISHED, SeriesStatus.ENDED] },
        posterPath: { not: null },
        backdropPath: { not: null },
      },
      orderBy: { popularity: 'desc' }, // or firstAirDate
      take: 2,
      select: {
        id: true,
        tmdbId: true,
        title: true,
        description: true,
        posterPath: true,
        backdropPath: true,
        firstAirDate: true,
        numberOfSeasons: true,
        tagline: true,
        genres: { select: { name: true } } /*, imdbRating, adult */,
        imdbRating: true,
      },
    });

    const [movies, series] = await Promise.all([moviesPromise, seriesPromise]);
    const heroItems = [
      ...movies.map((m) => mapToMediaItem(m, 'movie')),
      ...series.map((s) => mapToMediaItem(s, 'show')),
    ]
      .filter((item) => item !== null) // remove null items if mapToMediaItem returns null
      .sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0)) // overall sorting
      .slice(0, 5);

    console.log(`[ContentService] Found ${heroItems.length} hero items.`);
    return heroItems;
  } catch (error) {
    /* ... handle error with AppError ... */ throw new AppError(
      'خطا در واکشی اطلاعات هیرو ',
      500
    );
  }
};

/**
 * Service to fetch trending movies with a specified limit.
 * Retrieves movies with a published or archived status,
 * ensuring that they have a poster. The movies are sorted
 * by popularity in descending order to determine trending status.
 * Maps each movie to a MediaItem format suitable for the client side.
 *
 * @param {number} [limit=10] - The maximum number of trending movies to fetch.
 * @returns {Promise<MediaItem[]>} - A promise that resolves to an array of MediaItem objects.
 * @throws {AppError} - Throws an error if there is an issue fetching the trending movies.
 */

export const getTrendingMoviesService = async (limit = 10) => {
  console.log('[ContentService] Fetching trending movies...');
  try {
    const movies = await prisma.movie.findMany({
      where: {
        status: { in: [MovieStatus.PUBLISHED, MovieStatus.ARCHIVED] },
        posterPath: { not: null },
      },
      orderBy: { popularity: 'desc' }, // or any other criteria for "trending"
      take: limit,
      select: {
        /* ... fields needed for MediaItem ... */ id: true,
        title: true,
        posterPath: true,
        releaseDate: true,
        runtime: true,
        genres: { select: { name: true } },
        imdbRating: true,
        adult: true,
      },
    });
    return movies
      .map((m) => mapToMediaItem(m, 'movie'))
      .filter((item) => item !== null);
  } catch (error) {
    /* ... handle error ... */ throw new AppError(
      'خطا در واکشی فیلم‌های پرطرفدار.',
      500
    );
  }
};

export const getRecommendedShowsService = async (limit = 10) => {
  console.log('[ContentService] Fetching recommended shows...');
  try {
    const series = await prisma.series.findMany({
      where: {
        status: { in: [SeriesStatus.PUBLISHED, SeriesStatus.ENDED] },
        posterPath: { not: null },
      },
      orderBy: { popularity: 'desc' }, // یا هر معیار دیگری برای "پیشنهادی"
      take: limit,
      select: {
        /* ... فیلدهای لازم برای MediaItem ... */ id: true,
        title: true,
        posterPath: true,
        firstAirDate: true,
        numberOfSeasons: true,
        genres: { select: { name: true } },
        imdbRating: true,
        adult: true,
      },
    });
    return series
      .map((s) => mapToMediaItem(s, 'show'))
      .filter((item) => item !== null);
  } catch (error) {
    /* ... مدیریت خطا ... */ throw new AppError(
      'خطا در واکشی سریال‌های پیشنهادی.',
      500
    );
  }
};

/**
 * دریافت آیتم ویژه (مثال: آخرین فیلم مهم اضافه شده)
 */
export const getFeaturedItemService = async () => {
  console.log('[ContentService] Fetching featured item...');
  try {
    const movie = await prisma.movie.findFirst({
      // یا سریال
      where: {
        status: MovieStatus.PUBLISHED,
        backdropPath: { not: null },
        posterPath: { not: null },
      },
      orderBy: { createdAt: 'desc' }, // یا releaseDate
      select: {
        /* ... فیلدهای لازم برای MediaItem و FeaturedContentSection ... */
        id: true,
        title: true,
        description: true,
        posterPath: true,
        backdropPath: true,
        releaseDate: true,
        runtime: true,
        tagline: true,
        genres: { select: { name: true } },
        imdbRating: true,
        adult: true,
      },
    });
    return mapToMediaItem(movie, 'movie'); // یا 'show'
  } catch (error) {
    /* ... مدیریت خطا ... */ throw new AppError('خطا در واکشی آیتم ویژه.', 500);
  }
};

/**
 * دریافت ۱۰ فیلم برتر (مثلا بر اساس امتیاز IMDb یا محبوبیت)
 */
export const getTop10MoviesService = async (limit = 10) => {
  console.log('[ContentService] Fetching top 10 movies...');
  try {
    const movies = await prisma.movie.findMany({
      where: {
        status: { in: [MovieStatus.PUBLISHED, MovieStatus.ARCHIVED] },
        posterPath: { not: null },
        imdbRating: { not: null }, // یا popularity یا هر فیلد امتیاز دیگری
      },
      orderBy: [
        { imdbRating: 'desc' }, // اولویت با امتیاز IMDb
        { popularity: 'desc' }, // سپس محبوبیت
        { releaseDate: 'desc' },
      ],
      take: limit,
      select: {
        // فیلدهای لازم برای MediaItem + rank (که اینجا خودمان تولید می‌کنیم)
        id: true,
        title: true,
        posterPath: true,
        releaseDate: true,
        runtime: true,
        genres: { select: { name: true } },
        imdbRating: true,
        adult: true,
        description: true,
        // ... سایر فیلدهای مورد نیاز MediaItem ...
      },
    });
    // اضافه کردن rank به صورت دستی
    return movies
      .map((movie, index) => ({
        ...mapToMediaItem(movie, 'movie'),
        rank: index + 1,
      }))
      .filter((item) => item !== null);
  } catch (error) {
    console.error('[ContentService] Error fetching top 10 movies:', error);
    throw new AppError('خطا در واکشی ۱۰ فیلم برتر.', 500);
  }
};

/**
 * دریافت ۱۰ سریال برتر (مثلا بر اساس امتیاز IMDb یا محبوبیت)
 */
export const getTop10SeriesService = async (limit = 10) => {
  console.log(
    '-----------[ContentService] Fetching top 10 series... ---------------'
  );
  try {
    const series = await prisma.series.findMany({
      where: {
        status: {
          in: [
            SeriesStatus.PUBLISHED,
            SeriesStatus.ENDED,
            SeriesStatus.CANCELED,
          ],
        },

        // imdbRating: { not: null }, // یا popularity
      },
      orderBy: [
        { imdbRating: 'desc' },
        { popularity: 'desc' },
        { firstAirDate: 'desc' },
      ],
      take: limit,
      select: {
        // فیلدهای لازم برای MediaItem + rank
        id: true,
        title: true,
        posterPath: true,
        firstAirDate: true,
        numberOfSeasons: true,
        genres: { select: { name: true } },
        imdbRating: true,
        adult: true,
        description: true,
        // ... سایر فیلدهای مورد نیاز MediaItem ...
      },
    });
    console.log('This is result of top 10 series in service backend: ', series);
    // اضافه کردن rank به صورت دستی
    return series
      .map((s, index) => ({
        ...mapToMediaItem(s, 'show'),
        rank: index + 1,
      }))
      .filter((item) => item !== null);
  } catch (error) {
    console.error('[ContentService] Error fetching top 10 series:', error);
    throw new AppError('خطا در واکشی ۱۰ سریال برتر.', 500);
  }
};

/**
 * سریال‌های آتی را واکشی می‌کند.
 * @param {object} [options={}] - گزینه‌های واکشی.
 * @param {number} [options.limit=20] - تعداد آیتم‌ها برای بازگرداندن.
 * @param {number} [options.page=1] - شماره صفحه.
 * @returns {Promise<Array<object>>} - آرایه‌ای از آیتم‌های رسانه‌ای.
 * @throws {AppError} - اگر خطایی در واکشی رخ دهد.
 */
export const getUpcomingSeriesService = async (options = {}) => {
  const { limit = 20, page = 1 } = options;
  console.log('[ContentService] Fetching upcoming series...');
  try {
    const upcomingSeries = await prisma.series.findMany({
      where: {
        status: SeriesStatus.UPCOMING,
        posterPath: { not: null }, // اختیاری: فقط آن‌هایی که پوستر دارند
        firstAirDate: { not: null }, // اطمینان از وجود تاریخ برای مرتب‌سازی
      },
      orderBy: [
        { firstAirDate: 'asc' }, // مرتب‌سازی بر اساس تاریخ پخش
        { popularity: 'desc' }, // معیار دوم مرتب‌سازی
      ],
      take: parseInt(limit, 10), // اطمینان از اینکه limit عدد است
      skip: (parseInt(page, 10) - 1) * parseInt(limit, 10), // برای صفحه‌بندی
      select: {
        // فیلدهایی که برای MediaItem نیاز دارید
        id: true,
        title: true,
        posterPath: true,
        firstAirDate: true,
        numberOfSeasons: true,
        genres: { select: { name: true } },
        adult: true,
        description: true,
        // ... سایر فیلدهای مورد نیاز MediaItem
      },
    });

    // در اینجا نیازی به اضافه کردن rank نیست
    return upcomingSeries
      .map((series) => mapToMediaItem(series, 'show')) // 'show' یا نوع مناسب برای سریال
      .filter((item) => item !== null);
  } catch (error) {
    console.error('[ContentService] Error fetching upcoming series:', error);
    // اگر از Prisma.PrismaClientKnownRequestError استفاده می‌کنید، باید آن را هم require کنید
    // if (error instanceof Prisma.PrismaClientKnownRequestError) { // Prisma باید از @prisma/client وارد شود
    //   throw new Error(`خطا در واکشی سریال‌های آتی از پایگاه داده: ${error.message}`);
    // }
    // throw new AppError("خطا در واکشی سریال‌های آتی.", 500); // اگر AppError دارید
    throw new Error('خطا در واکشی سریال‌های آتی.'); // استفاده از Error استاندارد
  }
};

/**
 * فیلم‌های آتی را واکشی می‌کند.
 * @param {object} [options={}] - گزینه‌های واکشی.
 * @param {number} [options.limit=20] - تعداد آیتم‌ها.
 * @param {number} [options.page=1] - شماره صفحه.
 * @returns {Promise<Array<object>>} - آرایه‌ای از آیتم‌های رسانه‌ای.
 * @throws {Error} - اگر خطایی رخ دهد.
 */
export const getUpcomingMoviesService = async (options = {}) => {
  const { limit = 20, page = 1 } = options;
  console.log('[ContentService] Fetching upcoming movies...');
  try {
    const upcomingMovies = await prisma.movie.findMany({
      where: {
        status: MovieStatus.UPCOMING,
        posterPath: { not: null }, // اختیاری
        releaseDate: { not: null },
      },
      orderBy: [{ releaseDate: 'asc' }, { popularity: 'desc' }],
      take: parseInt(limit, 10),
      skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      select: {
        // فیلدهای لازم برای MediaItem از مدل Movie
        id: true,
        title: true,
        posterPath: true,
        releaseDate: true,
        // ... سایر فیلدهای فیلم
        genres: { select: { name: true } },
        adult: true,
        description: true,
      },
    });

    return upcomingMovies
      .map((movie) => mapToMediaItem(movie, 'movie')) // 'movie' یا نوع مناسب
      .filter((item) => item !== null);
  } catch (error) {
    console.error('[ContentService] Error fetching upcoming movies:', error);
    throw new Error('خطا در واکشی فیلم‌های آتی.');
  }
};
