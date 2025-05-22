import prisma from '../../config/db.js';
import { Role, CreditType, SeriesStatus } from '@prisma/client'; // تمام Enum های لازم
import { getTmdbSeriesDetails, getTmdbSeasonDetails } from './tmdbService.js'; // سرویس‌های TMDB
import { uploadImageFromUrl } from '../common/cloudinaryService.js'; // سرویس آپلود عکس
import AppError from '../../utils/AppError.js'; // کلاس خطای سفارشی // تایپ کلودیناری (اختیاری، می‌توان any گذاشت)
import streamifier from 'streamifier'; // برای آپلود بافر عکس پروفایل عوامل (اگر لازم شد)
import cloudinary from '../../config/cloudinary.js';

/**
 * سرویس برای دریافت لیست سریال‌ها با فیلتر نقش و صفحه‌بندی
 * @param {object} user - کاربر ادمین لاگین کرده
 * @param {object} options - آپشن‌های کوئری (page, limit, sortBy, sortOrder)
 * @returns {Promise<object>} - شامل لیست سریال‌ها و اطلاعات صفحه‌بندی
 */
export const getAllSeriesService = async (
  user,
  {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    // TODO: Add filtering options later (status, genre)
  }
) => {
  console.log(
    `Workspaceing series list for user ${user.id} (Role: ${user.role}) with options:`,
    { page, limit, sortBy, sortOrder }
  );
  try {
    const skip = (page - 1) * limit;
    const take = parseInt(limit, 10);
    if (isNaN(take) || take <= 0) throw new Error('مقدار limit نامعتبر است.');

    // فیلدهای مجاز مرتب‌سازی برای سریال
    const allowedSortFields = [
      'title',
      'firstAirDate',
      'lastAirDate',
      'createdAt',
      'popularity',
      'status',
      'tmdbId',
      'numberOfSeasons',
      'numberOfEpisodes',
    ];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : 'createdAt';
    const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    // شرط Where بر اساس نقش
    let whereCondition = {};
    if (user.role === Role.ADMIN) {
      whereCondition = { addedById: user.id }; // ادمین فقط سریال‌های خودش
      console.log(`Applying series filter: addedById = ${user.id}`);
    } else if (user.role !== Role.SUPER_ADMIN) {
      console.warn(
        `User role ${user.role} not allowed for series list. Returning empty.`
      );
      return {
        series: [],
        totalSeries: 0,
        totalPages: 0,
        currentPage: 1,
        limit: take,
      };
    } // سوپر ادمین فیلتر ندارد

    // واکشی سریال‌ها
    const series = await prisma.series.findMany({
      where: whereCondition,
      skip: skip,
      take: take,
      orderBy: { [safeSortBy]: safeSortOrder },
      select: {
        // فیلدهای لازم برای جدول ادمین
        id: true,
        title: true,
        tmdbId: true,
        firstAirDate: true,
        lastAirDate: true,
        numberOfSeasons: true,
        numberOfEpisodes: true,
        status: true,
        posterPath: true, // پوستر برای نمایش
        createdAt: true,
        addedBy: { select: { id: true, name: true, email: true } },
        // _count: { select: { seasons: true, comments: true, ratings: true } } // شمارش روابط (اختیاری)
      },
    });

    // تعداد کل سریال‌ها با فیلتر
    const totalSeries = await prisma.series.count({ where: whereCondition });
    const totalPages = Math.ceil(totalSeries / take);

    console.log(
      `Found ${series.length} series (Total matching criteria: ${totalSeries})`
    );
    return {
      series, // نام پراپرتی series است
      totalSeries,
      totalPages,
      currentPage: parseInt(page, 10),
      limit: take,
    };
  } catch (error) {
    console.error('Error fetching series list:', error);
    throw error; // ارسال به errorHandler
  }
};

/**
 * سرویس برای دریافت جزئیات کامل یک سریال بر اساس ID
 * @param {string} seriesId - ID سریال
 * @returns {Promise<object>} - آبجکت کامل سریال با روابط
 * @throws {AppError} - اگر سریال یافت نشد یا خطای دیگری رخ دهد
 */
export const getSeriesByIdService = async (seriesId) => {
  console.log(`Workspaceing details for series ID: ${seriesId}`);
  try {
    // از findUniqueOrThrow استفاده می‌کنیم تا اگر یافت نشد، خودش خطای Not Found بدهد
    const series = await prisma.series.findUniqueOrThrow({
      where: { id: seriesId },
      // انتخاب فیلدهای لازم برای نمایش/ویرایش جزئیات
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
        createdAt: true,
        updatedAt: true,
        // واکشی روابط لازم
        genres: { select: { id: true, name: true, tmdbId: true } }, // ژانرها
        seasons: {
          // فصل‌ها به همراه قسمت‌ها
          select: {
            id: true,
            tmdbId: true,
            seasonNumber: true,
            name: true,
            overview: true,
            airDate: true,
            posterPath: true,
            episodeCount: true,
            episodes: {
              select: {
                id: true,
                tmdbId: true,
                episodeNumber: true,
                seasonNumber: true,
                title: true,
                overview: true,
                airDate: true,
                runtime: true,
                stillPath: true,
              },
              orderBy: { episodeNumber: 'asc' },
            },
          },
          orderBy: { seasonNumber: 'asc' },
        },
        credits: {
          // عوامل
          select: {
            role: true,
            characterName: true,
            person: {
              select: {
                id: true,
                tmdbId: true,
                name: true,
                imageUrl: true,
                biography: true,
              },
            },
          },
          // orderBy: { /* ... */ } // مرتب‌سازی عوامل در صورت نیاز
        },
        addedBy: { select: { id: true, name: true, email: true } }, // ادمین اضافه‌کننده
      },
    });
    console.log(`Series details found for ID: ${seriesId}`);
    return series; // بازگرداندن آبجکت کامل سریال
  } catch (error) {
    console.error(`Error fetching series ${seriesId}:`, error);
    // بررسی خطای Prisma not found (P2025)
    if (error.code === 'P2025') {
      throw new AppError(`سریالی با شناسه ${seriesId} یافت نشد.`, 404);
    }
    // برای خطاهای دیگر
    throw new AppError('خطا در واکشی جزئیات سریال.', 500);
  }
};

/**
 * Create series Service Function
 * @param {object} inputData
 * @param {string} userId -> for How Added this Series
 * @returns {Promise<object>}
 */
export const createSeriesService = async (inputData, userId) => {
  const { tmdbId, status } = inputData;
  const parsedTmdbId = parseInt(tmdbId, 10);

  // ۱. ولیدیشن ورودی اولیه
  if (isNaN(parsedTmdbId) || parsedTmdbId <= 0) {
    throw new AppError('شناسه TMDB نامعتبر است.', 400);
  }
  console.log(
    `[Create Series] Start for TMDB ID: ${parsedTmdbId} by User: ${userId}`
  );

  // ۲. بررسی وجود سریال با این TMDB ID در دیتابیس
  try {
    const existingSeries = await prisma.series.findUnique({
      where: { tmdbId: parsedTmdbId },
      select: { id: true },
    });
    if (existingSeries) {
      throw new AppError(
        `سریالی با شناسه TMDB ${parsedTmdbId} قبلاً ثبت شده است.`,
        409
      );
    }
  } catch (error) {
    console.error('[Create Series] DB error checking existing series:', error);
    throw new AppError('خطا در بررسی وجود سریال.', 500);
  }

  // ۳. واکشی جزئیات کامل سریال از TMDB
  console.log(
    `[Create Series] Fetching TMDB details for ID: ${parsedTmdbId}...`
  );
  const tmdbDetails = await getTmdbSeriesDetails(parsedTmdbId); // این تابع خودش AppError دارد

  // --- شروع عملیات خارجی (قبل از تراکنش دیتابیس) ---

  // ۴. آپلود تصاویر اصلی سریال (پوستر و بک‌دراپ)
  const tmdbPosterPath = tmdbDetails.poster_path;
  const tmdbBackdropPath = tmdbDetails.backdrop_path;
  const tmdbBaseImageUrl = 'https://image.tmdb.org/t/p/original';
  console.log('[Create Series] Uploading series images to Cloudinary...');
  let posterCloudinaryUrl = null,
    backdropCloudinaryUrl = null;
  try {
    const [posterUploadResult, backdropUploadResult] = await Promise.all([
      uploadImageFromUrl(
        tmdbPosterPath ? `${tmdbBaseImageUrl}${tmdbPosterPath}` : null,
        {
          folder: 'parsflix_series_posters',
          public_id: `series_${parsedTmdbId}_poster`,
          overwrite: true,
        }
      ),
      uploadImageFromUrl(
        tmdbBackdropPath ? `${tmdbBaseImageUrl}${tmdbBackdropPath}` : null,
        {
          folder: 'parsflix_series_backdrops',
          public_id: `series_${parsedTmdbId}_backdrop`,
          overwrite: true,
        }
      ),
    ]);
    posterCloudinaryUrl = posterUploadResult?.secure_url || null;
    backdropCloudinaryUrl = backdropUploadResult?.secure_url || null;
    console.log('[Create Series] Series images upload finished.');
  } catch (uploadError) {
    console.error(
      '[Create Series] Cloudinary series images upload failed:',
      uploadError.message || uploadError
    );
    console.warn('[Create Series] Proceeding without series poster/backdrop.');
    // تصمیم بگیرید که آیا بدون عکس ادامه دهید یا خطا دهید
    // throw new AppError("خطا در آپلود تصاویر اصلی سریال.", 500);
  }

  // ۵. پردازش و Upsert ژانرها
  console.log('[Create Series] Upserting genres...');
  const genreConnectList = [];
  if (tmdbDetails.genres && tmdbDetails.genres.length > 0) {
    for (const tmdbGenre of tmdbDetails.genres) {
      if (!tmdbGenre.id || !tmdbGenre.name) continue;
      try {
        const genre = await prisma.genre.upsert({
          where: { tmdbId: tmdbGenre.id },
          update: { name: tmdbGenre.name },
          create: { tmdbId: tmdbGenre.id, name: tmdbGenre.name },
          select: { id: true },
        });
        genreConnectList.push({ id: genre.id });
      } catch (genreError) {
        console.error(
          `[Create Series] Failed to upsert genre ${tmdbGenre.name} (ID: ${tmdbGenre.id}):`,
          genreError
        );
      }
    }
  }
  console.log(
    `[Create Series] Genres processed: ${genreConnectList.length} genres to connect.`
  );

  // ۶. پردازش و Upsert افراد (عوامل) + آپلود عکس آن‌ها
  console.log('[Create Series] Upserting persons and preparing credits...');
  const creditsToCreateInTx = [];
  const personTmdbIdMap = new Map(); // کش کردن personId
  if (tmdbDetails.credits) {
    const castLimit = 20; // محدودیت تعداد بازیگران
    const relevantCredits = [
      ...(tmdbDetails.credits.cast || [])
        .slice(0, castLimit)
        .map((c) => ({ ...c, type: CreditType.ACTOR })),
      ...(tmdbDetails.credits.crew || [])
        .filter((c) => c.job === 'Director' || c.job === 'Creator')
        .map((c) => ({ ...c, type: CreditType.DIRECTOR })),
      // می‌توانید نقش‌های دیگر را اضافه کنید
    ];
    for (const credit of relevantCredits) {
      if (!credit.id || !credit.name) continue;
      let personId = personTmdbIdMap.get(credit.id);
      let personImageUrl = null;
      if (credit.profile_path) {
        // آپلود عکس شخص
        try {
          const personUploadResult = await uploadImageFromUrl(
            `${tmdbBaseImageUrl}${credit.profile_path}`,
            {
              folder: 'parsflix_persons',
              public_id: `person_${credit.id}`,
              overwrite: true,
            }
          );
          personImageUrl = personUploadResult?.secure_url || null;
        } catch (e) {
          console.error(
            `[Create Series] Failed to upload image for person ${credit.name}:`,
            e.message || e
          );
        }
      }
      if (!personId) {
        // Upsert شخص
        try {
          const person = await prisma.person.upsert({
            where: { tmdbId: credit.id },
            update: {
              name: credit.name,
              imageUrl: personImageUrl,
              biography: credit.biography || undefined,
            },
            create: {
              tmdbId: credit.id,
              name: credit.name,
              imageUrl: personImageUrl,
              biography: credit.biography || undefined,
            },
            select: { id: true },
          });
          personId = person.id;
          personTmdbIdMap.set(credit.id, personId);
        } catch (personError) {
          console.error(
            `[Create Series] Failed to upsert person ${credit.name}:`,
            personError
          );
          continue;
        }
      } else if (personImageUrl) {
        // آپدیت عکس فرد موجود
        try {
          await prisma.person.update({
            where: { id: personId },
            data: { imageUrl: personImageUrl },
          });
        } catch (personUpdateError) {
          console.error(
            `[Create Series] Failed to update image for person ${credit.name}:`,
            personUpdateError
          );
        }
      }
      // اضافه کردن به لیست کردیت‌ها برای ذخیره نهایی در تراکنش
      creditsToCreateInTx.push({
        personId: personId,
        role: credit.type,
        characterName: credit.character || null,
      });
    }
  }
  console.log(
    `[Create Series] Persons processed: ${creditsToCreateInTx.length} credits to create later.`
  );

  // ۷. آماده‌سازی داده‌های فصل‌ها و قسمت‌ها (واکشی جزئیات و آپلود عکس‌ها قبل از تراکنش)
  console.log('[Create Series] Preparing seasons and episodes data...');
  const seasonsWithEpisodesData = []; // شامل اطلاعات فصل و آرایه قسمت‌هایش
  if (tmdbDetails.seasons && tmdbDetails.seasons.length > 0) {
    for (const tmdbSeason of tmdbDetails.seasons) {
      const seasonNumber = tmdbSeason.season_number;
      if (seasonNumber === undefined || seasonNumber === null) continue;
      console.log(
        `[Create Series] Processing data for season ${seasonNumber}...`
      );
      let seasonPosterUrl = null;
      if (tmdbSeason.poster_path) {
        // آپلود پوستر فصل
        try {
          const result = await uploadImageFromUrl(
            `${tmdbBaseImageUrl}${tmdbSeason.poster_path}`,
            {
              folder: 'parsflix_season_posters',
              public_id: `series_${parsedTmdbId}_season_${seasonNumber}_poster`,
              overwrite: true,
            }
          );
          seasonPosterUrl = result?.secure_url || null;
        } catch (e) {
          console.error(
            `[Create Series] Failed to upload poster for season ${seasonNumber}:`,
            e.message || e
          );
        }
      }
      // آماده‌سازی داده‌های فصل
      const seasonDataForTx = {
        tmdbId: tmdbSeason.id,
        seasonNumber: seasonNumber,
        name: tmdbSeason.name,
        overview: tmdbSeason.overview,
        airDate: tmdbSeason.air_date ? new Date(tmdbSeason.air_date) : null,
        posterPath: seasonPosterUrl,
        episodeCount: tmdbSeason.episode_count,
      };
      const episodesDataForTx = [];

      // واکشی جزئیات فصل و قسمت‌ها از TMDB
      try {
        const seasonDetails = await getTmdbSeasonDetails(
          parsedTmdbId,
          seasonNumber
        );
        if (seasonDetails?.episodes && seasonDetails.episodes.length > 0) {
          console.log(
            `[Create Series] Processing ${seasonDetails.episodes.length} episodes for season ${seasonNumber}...`
          );
          for (const tmdbEpisode of seasonDetails.episodes) {
            if (!tmdbEpisode.id || !tmdbEpisode.episode_number) continue;
            // آپلود عکس صحنه قسمت
            let episodeStillUrl = null;
            if (tmdbEpisode.still_path) {
              try {
                const result = await uploadImageFromUrl(
                  `${tmdbBaseImageUrl}${tmdbEpisode.still_path}`,
                  {
                    folder: 'parsflix_episode_stills',
                    public_id: `series_${parsedTmdbId}_s${seasonNumber}_e${tmdbEpisode.episode_number}_still`,
                    overwrite: true,
                  }
                );
                episodeStillUrl = result?.secure_url || null;
              } catch (e) {
                console.error(
                  `[Create Series] Failed to upload still for S${seasonNumber}E${tmdbEpisode.episode_number}:`,
                  e.message || e
                );
              }
            }
            // ذخیره اطلاعات قسمت برای ایجاد در تراکنش
            episodesDataForTx.push({
              tmdbId: tmdbEpisode.id,
              episodeNumber: tmdbEpisode.episode_number,
              seasonNumber: seasonNumber,
              title: tmdbEpisode.name,
              overview: tmdbEpisode.overview,
              airDate: tmdbEpisode.air_date
                ? new Date(tmdbEpisode.air_date)
                : null,
              runtime: tmdbEpisode.runtime,
              stillPath: episodeStillUrl,
            });
          } // پایان حلقه قسمت‌ها
        } // پایان if episodes
      } catch (seasonDetailError) {
        console.error(
          `[Create Series] Failed to fetch/process details for season ${seasonNumber}:`,
          seasonDetailError.message || seasonDetailError
        );
      }

      // اضافه کردن داده‌های فصل به همراه قسمت‌هایش
      seasonsWithEpisodesData.push({
        seasonData: seasonDataForTx,
        episodesData: episodesDataForTx,
      });
    } // پایان حلقه فصل‌ها
  }
  console.log('[Create Series] Finished preparing external data.');
  // --- پایان عملیات خارجی ---

  // --- شروع Transaction Prisma ---
  console.log('[Create Series] Starting database transaction...');
  try {
    const createdSeriesDetails = await prisma.$transaction(
      async (tx) => {
        // ۸. ایجاد رکورد سریال
        console.log('TX: Creating series record...');
        const seriesStatusEnumValue =
          status && Object.values(SeriesStatus).includes(status)
            ? SeriesStatus[status]
            : SeriesStatus.PENDING;
        const newSeries = await tx.series.create({
          data: {
            tmdbId: parsedTmdbId,
            title: tmdbDetails.name || 'بدون عنوان',
            originalTitle: tmdbDetails.original_name,
            tagline: tmdbDetails.tagline,
            description: tmdbDetails.overview,
            firstAirDate: tmdbDetails.first_air_date
              ? new Date(tmdbDetails.first_air_date)
              : null,
            lastAirDate: tmdbDetails.last_air_date
              ? new Date(tmdbDetails.last_air_date)
              : null,
            status: seriesStatusEnumValue,
            tmdbStatus: tmdbDetails.status,
            type: tmdbDetails.type,
            originalLanguage: tmdbDetails.original_language,
            popularity: tmdbDetails.popularity,
            numberOfSeasons: tmdbDetails.number_of_seasons,
            numberOfEpisodes: tmdbDetails.number_of_episodes,
            homepage: tmdbDetails.homepage,
            adult: tmdbDetails.adult || false,
            posterPath: posterCloudinaryUrl,
            backdropPath: backdropCloudinaryUrl,
            addedById: userId,
            genres: { connect: genreConnectList },
          },
          select: { id: true },
        });
        console.log(`TX: Series record created with ID: ${newSeries.id}`);

        // ۹. ایجاد رکورد فصل‌ها و قسمت‌ها
        if (seasonsWithEpisodesData.length > 0) {
          console.log(
            `TX: Processing ${seasonsWithEpisodesData.length} seasons for creation...`
          );
          for (const seasonGroup of seasonsWithEpisodesData) {
            const seasonData = {
              ...seasonGroup.seasonData,
              seriesId: newSeries.id,
            };
            console.log(`TX: Creating season ${seasonData.seasonNumber}...`);
            const createdSeason = await tx.season.create({
              data: seasonData,
              select: { id: true }, // ID فصل ایجاد شده را بگیر
            });
            console.log(
              `TX: Season ${seasonData.seasonNumber} created with ID ${createdSeason.id}.`
            );

            // ایجاد قسمت‌های این فصل
            const episodesDataWithSeasonId = seasonGroup.episodesData.map(
              (ep) => ({
                ...ep,
                seasonId: createdSeason.id, // اتصال به ID فصل ایجاد شده
              })
            );

            if (episodesDataWithSeasonId.length > 0) {
              console.log(
                `TX: Creating ${episodesDataWithSeasonId.length} episode records for season ${seasonData.seasonNumber}...`
              );
              await tx.episode.createMany({
                data: episodesDataWithSeasonId,
                skipDuplicates: true,
              });
              console.log(
                `TX: Episodes created for season ${seasonData.seasonNumber}.`
              );
            }
          }
          console.log('TX: Finished creating seasons and episodes.');
        }

        // ۱۰. ایجاد رکوردهای SeriesCredit
        if (creditsToCreateInTx.length > 0) {
          console.log(
            `TX: Creating ${creditsToCreateInTx.length} series credit records...`
          );
          const creditDataToInsert = creditsToCreateInTx.map((c) => ({
            seriesId: newSeries.id,
            personId: c.personId,
            role: c.role,
            characterName: c.characterName,
          }));
          await tx.seriesCredit.createMany({
            data: creditDataToInsert,
            skipDuplicates: true,
          });
          console.log('TX: Series credit records created.');
        }

        // ۱۱. واکشی نهایی سریال با جزئیات کامل
        console.log('TX: Fetching final created series details...');
        const finalSeries = await tx.series.findUnique({
          where: { id: newSeries.id },
          select: {
            // Select کامل
            id: true,
            title: true,
            tmdbId: true,
            firstAirDate: true,
            lastAirDate: true,
            status: true,
            tmdbStatus: true,
            type: true,
            numberOfSeasons: true,
            numberOfEpisodes: true,
            homepage: true,
            adult: true,
            createdAt: true,
            updatedAt: true,
            imdbRating: true,
            rottenTomatoesScore: true,
            posterPath: true,
            backdropPath: true,
            description: true,
            tagline: true,
            originalLanguage: true,
            popularity: true,
            genres: {
              select: { id: true, name: true, tmdbId: true, imageUrl: true },
            },
            seasons: {
              select: {
                id: true,
                tmdbId: true,
                seasonNumber: true,
                name: true,
                overview: true,
                airDate: true,
                posterPath: true,
                episodeCount: true,
                episodes: {
                  select: {
                    id: true,
                    tmdbId: true,
                    episodeNumber: true,
                    seasonNumber: true,
                    title: true,
                    overview: true,
                    airDate: true,
                    runtime: true,
                    stillPath: true,
                  },
                  orderBy: { episodeNumber: 'asc' },
                },
              },
              orderBy: { seasonNumber: 'asc' },
            },
            credits: {
              select: {
                role: true,
                characterName: true,
                person: {
                  select: {
                    id: true,
                    tmdbId: true,
                    name: true,
                    imageUrl: true,
                    biography: true,
                  },
                },
              },
            },
            addedBy: { select: { id: true, name: true, email: true } },
          },
        });
        if (!finalSeries)
          throw new AppError('خطای غیرمنتظره: سریال ایجاد شده یافت نشد.', 500);
        return finalSeries;
      },
      { timeout: 60000 }
    ); // ۶۰ ثانیه تایم‌اوت برای تراکنش دیتابیس

    console.log(
      `[Create Series Service] Transaction successful. Process completed for TMDB ID: ${parsedTmdbId}`
    );
    return createdSeriesDetails;
  } catch (error) {
    console.error(
      '[Create Series Service] Error during database transaction:',
      error
    );
    if (error instanceof AppError) throw error;
    // خطای Prisma یا ناشناخته دیگر
    throw new AppError(
      `خطا در ذخیره اطلاعات سریال در دیتابیس: ${error.message || error}`,
      500
    );
  }
};
// End of createSeriesService

/**
 * سرویس برای حذف یک سریال با بررسی دسترسی
 * @param {string} seriesId - ID سریال برای حذف
 * @param {object} user - کاربر ادمین لاگین کرده
 * @returns {Promise<boolean>} - true در صورت موفقیت
 */
export const deleteSeriesService = async (seriesId, user) => {
  console.log(`Admin ${user.id} attempting to delete series ${seriesId}.`);

  // ۱. پیدا کردن سریال و ادمین اضافه‌کننده
  const series = await prisma.series.findUnique({
    where: { id: seriesId },
    select: { id: true, title: true, addedById: true },
  });

  if (!series) {
    throw new AppError('سریال مورد نظر یافت نشد.', 404);
  }

  // ۲. بررسی دسترسی
  const canDelete =
    user.role === Role.SUPER_ADMIN ||
    (user.role === Role.ADMIN && series.addedById === user.id);

  if (!canDelete) {
    throw new AppError('شما اجازه حذف این سریال را ندارید.', 403);
  }

  // ۳. حذف سریال (و روابط Cascade مثل Season, Episode, SeriesCredit)
  try {
    await prisma.series.delete({
      where: { id: seriesId },
    });
    console.log(
      `Series <span class="math-inline">\{seriesId\} \(</span>{series.title}) deleted successfully by admin ${user.id}.`
    );
    return true;
  } catch (error) {
    console.error(`Error deleting series ${seriesId}:`, error);
    // بررسی خطاهای احتمالی Prisma
    // if (error instanceof Prisma.PrismaClientKnownRequestError) { ... }
    throw new AppError('خطا در حذف سریال از دیتابیس.', 500);
  }
};

/**
 * سرویس برای به‌روزرسانی اطلاعات پایه یک سریال
 * @param {string} seriesId - ID سریال
 * @param {object} updateData - داده‌های جدید
 * @param {object} user - کاربر ادمین
 * @returns {Promise<object>} - سریال آپدیت شده
 */
export const updateSeriesService = async (seriesId, updateData, user) => {
  console.log(
    `Attempting to update series ${seriesId} by user ${user.id} (Role: ${user.role})`
  );
  console.log('Received updateData:', JSON.stringify(updateData, null, 2)); // لاگ داده دریافتی

  // ۱. پیدا کردن سریال و بررسی دسترسی
  let series;
  try {
    series = await prisma.series.findUnique({
      where: { id: seriesId },
      select: { id: true, addedById: true },
    });
  } catch (e) {
    throw new AppError('خطا در یافتن سریال.', 500);
  }

  if (!series) {
    throw new AppError('سریال مورد نظر یافت نشد.', 404);
  }
  const canUpdate =
    user.role === Role.SUPER_ADMIN ||
    (user.role === Role.ADMIN && series.addedById === user.id);
  if (!canUpdate) {
    throw new AppError('شما اجازه ویرایش این سریال را ندارید.', 403);
  }

  // ۲. آماده‌سازی داده‌ها
  const directUpdateData = {};
  const relationUpdates = {}; // <<<--- تعریف relationUpdates ---<<<
  const allowedFields = [
    'title',
    'originalTitle',
    'tagline',
    'description',
    'firstAirDate',
    'lastAirDate',
    'status',
    'tmdbStatus',
    'type',
    'originalLanguage',
    'popularity',
    'numberOfSeasons',
    'numberOfEpisodes',
    'homepage',
    'adult',
    'imdbRating',
    'rottenTomatoesScore',
    'trailerUrl',
  ];

  for (const key of Object.keys(updateData)) {
    if (allowedFields.includes(key)) {
      // پردازش فیلدهای مستقیم (مطمئن شوید این بخش درست است)
      if (
        key === 'status' &&
        updateData.status &&
        Object.values(SeriesStatus).includes(updateData.status)
      ) {
        directUpdateData.status = SeriesStatus[updateData.status];
      } else if (
        (key === 'firstAirDate' || key === 'lastAirDate') &&
        updateData[key] !== undefined
      ) {
        // چک کردن undefined
        directUpdateData[key] = updateData[key]
          ? new Date(updateData[key])
          : null;
      } else if (
        (key === 'numberOfSeasons' ||
          key === 'numberOfEpisodes' ||
          key === 'rottenTomatoesScore') &&
        updateData[key] !== undefined
      ) {
        directUpdateData[key] =
          updateData[key] === null
            ? null
            : parseInt(updateData[key], 10) || null;
      } else if (
        (key === 'popularity' || key === 'imdbRating') &&
        updateData[key] !== undefined
      ) {
        directUpdateData[key] =
          updateData[key] === null ? null : parseFloat(updateData[key]) || null;
      } else if (key === 'adult') {
        directUpdateData.adult = Boolean(updateData.adult);
      } else if (updateData[key] !== undefined) {
        // کپی سایر مقادیر (شامل null یا رشته خالی)
        directUpdateData[key] = updateData[key];
      }
    }
    // --->>> پردازش genreIds و اضافه کردن به relationUpdates <<<---
    else if (key === 'genreIds' && Array.isArray(updateData.genreIds)) {
      relationUpdates.genres = {
        set: updateData.genreIds.map((id) => ({ id: id })),
      };
      console.log(
        `Preparing to set genres for series ${seriesId} to IDs:`,
        updateData.genreIds
      );
    }
    // -------------------------------------------------------
  }

  // چک کردن اینکه آیا داده‌ای برای آپدیت وجود دارد
  if (
    Object.keys(directUpdateData).length === 0 &&
    Object.keys(relationUpdates).length === 0
  ) {
    throw new AppError('هیچ داده معتبری برای به‌روزرسانی ارائه نشده است.', 400);
  }

  // --->>> ترکیب داده‌ها <<<---
  const finalUpdateData = { ...directUpdateData, ...relationUpdates };
  // ------------------------
  console.log('--- Final Data for prisma.series.update ---');
  console.log(JSON.stringify(finalUpdateData, null, 2));

  // ۳. آپدیت سریال در دیتابیس
  try {
    const updatedSeries = await prisma.series.update({
      where: { id: seriesId },
      data: finalUpdateData, // <-- استفاده از داده‌های ترکیب شده
      select: {
        // Select نهایی برای بازگشت به کلاینت
        id: true,
        title: true, // ... سایر فیلدها ...
        genres: { select: { id: true, name: true } }, // <-- ژانرهای آپدیت شده
        addedBy: { select: { id: true, name: true, email: true } },
        // ... سایر select ها ...
      },
    });
    console.log(`Series ${seriesId} updated successfully.`);
    return updatedSeries;
  } catch (error) {
    console.error(`Error updating series ${seriesId} in DB:`, error);
    throw new AppError('خطا در به‌روزرسانی سریال در دیتابیس.', 500);
  }
};

/**
 * سرویس برای آپدیت عکس سریال (پوستر یا بک‌دراپ)
 * @param {string} seriesId - ID سریال
 * @param {string} userId - ID کاربر ادمین
 * @param {Role} userRole - نقش کاربر ادمین
 * @param {Express.Multer.File} fileObject - آبجکت فایل از Multer
 * @param {'poster' | 'backdrop'} imageType - نوع عکس
 * @returns {Promise<object>} - سریال آپدیت شده با URL جدید
 */
export const updateSeriesImageService = async (
  seriesId,
  userId,
  userRole,
  fileObject,
  imageType
) => {
  console.log(
    `[Update Series Image] Start for ${imageType}, Series ID: ${seriesId} by User: ${userId}`
  );

  // ۱. پیدا کردن سریال و بررسی دسترسی
  const series = await prisma.series.findUnique({
    where: { id: seriesId },
    select: { id: true, addedById: true },
  });
  if (!series) {
    throw new AppError('سریال مورد نظر یافت نشد.', 404);
  }
  const canUpdate =
    userRole === Role.SUPER_ADMIN ||
    (userRole === Role.ADMIN && series.addedById === userId);
  if (!canUpdate) {
    throw new AppError(
      `شما اجازه ویرایش عکس این سریال را ندارید (${imageType}).`,
      403
    );
  }

  // ۲. تابع داخلی آپلود به کلودیناری
  const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
      const folder =
        imageType === 'poster'
          ? 'parsflix_series_posters'
          : 'parsflix_series_backdrops';
      const public_id = `series_${seriesId}_${imageType}`; // نامگذاری یکتا برای بازنویسی
      console.log(
        `[Update Series Image] Uploading to Cloudinary folder: ${folder}, public_id: ${public_id}`
      );

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folder, public_id: public_id, overwrite: true },
        (error, result) => {
          if (error)
            return reject(
              new AppError(
                `Cloudinary Upload Error: ${error.message || 'Unknown'}`,
                500
              )
            );
          if (!result || !result.secure_url)
            return reject(
              new AppError('آپلود کلودیناری نتیجه معتبری برنگرداند.', 500)
            );
          resolve(result);
        }
      );
      uploadStream.on('error', (err) =>
        reject(new AppError(`Cloudinary Stream Error: ${err.message}`, 500))
      );
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  };

  // ۳. آپلود فایل جدید
  try {
    const uploadResult = await uploadToCloudinary(fileObject.buffer);
    const newImageUrl = uploadResult.secure_url;
    console.log(`[Update Series Image] ${imageType} uploaded: ${newImageUrl}`);

    // ۴. آپدیت دیتابیس
    const fieldToUpdate =
      imageType === 'poster' ? 'posterPath' : 'backdropPath';
    const updatedSeries = await prisma.series.update({
      where: { id: seriesId },
      data: { [fieldToUpdate]: newImageUrl }, // فقط فیلد عکس مربوطه آپدیت می‌شود
      select: {
        // بازگرداندن سریال کامل (یا فقط فیلدهای لازم)
        id: true,
        title: true, // ... سایر فیلدها ...
        posterPath: true,
        backdropPath: true, // فیلدهای عکس آپدیت شده
        genres: { select: { id: true, name: true } },
        addedBy: { select: { id: true, name: true } },
      },
    });
    console.log(
      `[Update Series Image] Series ${seriesId} ${fieldToUpdate} updated in DB.`
    );
    return updatedSeries;
  } catch (error) {
    console.error(`[Update Series Image] Error for ${imageType}:`, error);
    // اگر خطا از AppError بود، دوباره پرتاب کن، وگرنه خطای عمومی بساز
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || `خطا در آپلود/ذخیره ${imageType}`, 500);
  }
};
