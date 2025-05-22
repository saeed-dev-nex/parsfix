// server/src/services/movieService.js
import { Role, CreditType, MovieStatus } from '@prisma/client';
import prisma from '../../config/db.js';
import { getTmdbMovieDetails } from './tmdbService.js';
import { uploadImageFromUrl } from '../common/cloudinaryService.js'; // اطمینان از مسیر صحیح
import AppError from '../../utils/AppError.js';
import cloudinary from '../../config/cloudinary.js';
import streamifier from 'streamifier'; // برای تبدیل بافر به استریم
// import AppError from '../utils/AppError.js'; // برای خطاهای سفارشی

/*-----------------------------------------------------*/
/*                Get All Movies from DB               */
/*-----------------------------------------------------*/

/**
 * Service for getting list of movies filtered based on user role
 * @param {object} user - user must loggedIn
 * @param {object} options - page,limit, sortBy,sortOrder
 * @return {Promise<boolean>}
 */
export const getAllMoviesService = async (
  user,
  { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' }
) => {
  console.log(`Fetching movies for user ${user.id} with role ${user.role}`);
  try {
    const skip = (page - 1) * limit;
    const take = parseInt(limit, 10);
    if (isNaN(take) || take <= 0) {
      throw new Error('مقدار limit نامعتبر است.');
    }

    // فیلدهای مجاز مرتب‌سازی
    const allowedSortFields = [
      'title',
      'releaseDate',
      'createdAt',
      'popularity',
      'status',
      'tmdbId',
      'imdbRating',
      'rottenTomatoesScore',
    ];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : 'createdAt';
    const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    // شرط Where بر اساس نقش
    let whereCondition = {};
    if (user.role === Role.ADMIN) {
      whereCondition = { addedById: user.id };
    } else if (user.role !== Role.SUPER_ADMIN) {
      console.warn(
        `User role ${user.role} is not ADMIN or SUPER_ADMIN. Returning empty list.`
      );
      return {
        movies: [],
        totalMovies: 0,
        totalPages: 0,
        currentPage: 1,
        limit: take,
      };
    }

    // واکشی فیلم‌ها
    const movies = await prisma.movie.findMany({
      where: whereCondition,
      skip: skip,
      take: take,
      orderBy: { [safeSortBy]: safeSortOrder },
      select: {
        id: true,
        title: true,
        tmdbId: true,
        releaseDate: true,
        status: true,
        createdAt: true,
        imdbRating: true,
        rottenTomatoesScore: true,
        posterPath: true,
        _count: { select: { comments: true, ratings: true } },
        addedBy: { select: { id: true, name: true, email: true } },
      },
    });

    // تعداد کل فیلم‌ها
    const totalMovies = await prisma.movie.count({ where: whereCondition });
    const totalPages = Math.ceil(totalMovies / take);

    console.log(`Found ${movies.length} movies (Total: ${totalMovies})`);
    return {
      movies,
      totalMovies,
      totalPages,
      currentPage: parseInt(page, 10),
      limit: take,
    };
  } catch (error) {
    console.error('Error in getAllMoviesService:', error);
    throw error;
  }
};

/*--------------------------------------------------*---------*/
/* Service for creating new movie by fetching data from TMDB  */
/*--------------------------------------------------*---------*/

export const createMovieService = async (inputData, userId) => {
  const { tmdbId, status } = inputData;
  const parsedTmdbId = parseInt(tmdbId, 10);

  if (isNaN(parsedTmdbId) || parsedTmdbId <= 0) {
    throw new Error('شناسه TMDB نامعتبر است.');
  }
  console.log(
    `Starting createMovieService for TMDB ID: ${parsedTmdbId} by User ID: ${userId}`
  );

  // ۱. چک کردن وجود فیلم
  const existingMovie = await prisma.movie.findUnique({
    where: { tmdbId: parsedTmdbId },
    select: { id: true },
  });
  if (existingMovie) {
    throw new AppError(
      `فیلمی با شناسه TMDB ${parsedTmdbId} قبلاً در سیستم ثبت شده است.`,
      409
    );
  }

  // ۲. واکشی جزئیات TMDB
  const tmdbDetails = await getTmdbMovieDetails(parsedTmdbId);
  if (!tmdbDetails) {
    throw new AppError(
      `جزئیات فیلم با شناسه TMDB ${parsedTmdbId} از TMDB دریافت نشد.`,
      401
    );
  }

  // ۳. آپلود تصاویر فیلم
  const tmdbPosterPath = tmdbDetails.poster_path;
  const tmdbBackdropPath = tmdbDetails.backdrop_path;
  const tmdbBaseImageUrl = 'https://image.tmdb.org/t/p/original'; // آدرس پایه عکس TMDB
  console.log('Uploading movie images to Cloudinary...');
  const [posterUploadResult, backdropUploadResult] = await Promise.all([
    uploadImageFromUrl(
      tmdbPosterPath ? `${tmdbBaseImageUrl}${tmdbPosterPath}` : null,
      {
        folder: 'parsflix_posters',
        public_id: `movie_${parsedTmdbId}_poster`,
        overwrite: true,
      }
    ),
    uploadImageFromUrl(
      tmdbBackdropPath ? `${tmdbBaseImageUrl}${tmdbBackdropPath}` : null,
      {
        folder: 'parsflix_backdrops',
        public_id: `movie_${parsedTmdbId}_backdrop`,
        overwrite: true,
      }
    ),
  ]);
  const posterCloudinaryUrl = posterUploadResult?.secure_url || null;
  const backdropCloudinaryUrl = backdropUploadResult?.secure_url || null;
  console.log('Movie image uploads finished.', {
    posterCloudinaryUrl,
    backdropCloudinaryUrl,
  });

  // ۴. پردازش ژانرها
  console.log('Upserting genres...');
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
          `Failed to upsert genre ${tmdbGenre.name} (ID: ${tmdbGenre.id}):`,
          genreError
        );
      }
    }
  }
  console.log(
    `Finished upserting genres. ${genreConnectList.length} genres to connect.`
  );

  // ۵. پردازش افراد و آماده‌سازی Credits
  console.log('Upserting persons and preparing credits...');
  const creditsToCreate = [];
  const personTmdbIdMap = new Map();
  console.log('credits ====================> ', tmdbDetails.credits);

  if (tmdbDetails.credits) {
    const castLimit = 20;
    const relevantCredits = [
      ...(tmdbDetails.credits.cast || [])
        .slice(0, castLimit)
        .map((c) => ({ ...c, type: CreditType.ACTOR })),
      ...(tmdbDetails.credits.crew || [])
        .filter((c) => c.job === 'Director')
        .map((c) => ({ ...c, type: CreditType.DIRECTOR })),
    ];

    for (const credit of relevantCredits) {
      if (!credit.id || !credit.name) continue;

      let personId = personTmdbIdMap.get(credit.id);
      let personImageUrl = null; // مقدار اولیه null

      // --- آپلود عکس شخص ---
      if (credit.profile_path) {
        // --->>> اصلاح نحوه ساخت URL <<<---
        const tmdbPersonImageUrl = `${tmdbBaseImageUrl}${credit.profile_path}`;
        // ------------------------------
        console.log(
          `Uploading person image from: ${tmdbPersonImageUrl.substring(
            0,
            60
          )}...`
        );
        const personUploadResult = await uploadImageFromUrl(
          tmdbPersonImageUrl,
          {
            folder: 'parsflix_persons',
            public_id: `person_${credit.id}`,
            overwrite: true,
          }
        );
        personImageUrl = personUploadResult?.secure_url || null; // ذخیره URL کلودیناری
        console.log(
          `Person image uploaded for ${credit.name}: ${personImageUrl}`
        );
      }
      // -----------------------

      if (!personId) {
        // اگر شخص در map نبود، در دیتابیس جستجو/ایجاد کن
        try {
          const person = await prisma.person.upsert({
            where: { tmdbId: credit.id },
            update: {
              name: credit.name,
              imageUrl: personImageUrl,
              biography: credit.biography || undefined,
            }, // اضافه کردن بیوگرافی
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
            `Failed to upsert person ${credit.name} (ID: ${credit.id}):`,
            personError
          );
          continue; // از این کردیت رد شو
        }
      } else if (personImageUrl) {
        // اگر شخص بود و عکس جدیدی آپلود شد، آپدیت کن
        try {
          await prisma.person.update({
            where: { id: personId },
            data: { imageUrl: personImageUrl },
          });
        } catch (personUpdateError) {
          console.error(
            `Failed to update image for existing person ${credit.name} (ID: ${credit.id}):`,
            personUpdateError
          );
        }
      }

      // اضافه کردن به لیست کردیت‌ها برای ذخیره نهایی
      creditsToCreate.push({
        personId: personId,
        role: credit.type, // ACTOR or DIRECTOR (از نوع enum CreditType)
        characterName: credit.character || null, // نام کاراکتر
      });
    }
  }
  console.log(
    `Finished upserting persons. ${creditsToCreate.length} credits to create.`
  );

  // ۶. ایجاد رکورد فیلم
  console.log('Creating movie record in DB...');
  let newMovie;
  try {
    // تبدیل status رشته‌ای به enum
    const movieStatusEnumValue =
      status && Object.values(MovieStatus).includes(status)
        ? MovieStatus[status]
        : MovieStatus.PENDING;

    newMovie = await prisma.movie.create({
      data: {
        tmdbId: parsedTmdbId,
        title: inputData.title || tmdbDetails.title || 'بدون عنوان',
        originalTitle: tmdbDetails.original_title,
        tagline: tmdbDetails.tagline,
        description: inputData.description || tmdbDetails.overview,
        releaseDate: tmdbDetails.release_date
          ? new Date(tmdbDetails.release_date)
          : null,
        runtime: tmdbDetails.runtime,
        status: movieStatusEnumValue, // <-- استفاده از enum
        originalLanguage: tmdbDetails.original_language,
        popularity: tmdbDetails.popularity,
        imdbId: tmdbDetails.imdb_id,
        adult: tmdbDetails.adult || false,
        posterPath: posterCloudinaryUrl,
        backdropPath: backdropCloudinaryUrl,
        trailerUrl: tmdbDetails.videos?.results?.find(
          (v) => v.site === 'YouTube' && v.type === 'Trailer'
        )?.key
          ? `https://www.youtube.com/watch?v=${
              tmdbDetails.videos.results.find(
                (v) => v.site === 'YouTube' && v.type === 'Trailer'
              ).key
            }`
          : null,
        imdbRating: tmdbDetails.vote_average
          ? parseFloat(tmdbDetails.vote_average.toFixed(1))
          : null, // اضافه کردن امتیاز imdb
        // rottenTomatoesScore: ? // نیاز به منبع دیگری برای این امتیاز است
        addedById: userId,
        genres: { connect: genreConnectList },
      },
      select: { id: true }, // فقط ID برای مرحله بعد
    });
    console.log(`Movie record created with ID: ${newMovie.id}`);
  } catch (movieCreateError) {
    console.error('!!! Error creating movie record in DB:', movieCreateError);
    throw movieCreateError;
  }

  // ۷. ایجاد رکوردهای MovieCredit
  if (creditsToCreate.length > 0) {
    console.log(`Creating ${creditsToCreate.length} movie credit records...`);
    try {
      const dataToInsert = creditsToCreate.map((credit) => ({
        movieId: newMovie.id,
        personId: credit.personId,
        role: credit.role, // مقدار enum است
        characterName: credit.characterName,
      }));
      await prisma.movieCredit.createMany({
        data: dataToInsert,
        skipDuplicates: true,
      });
      console.log('Movie credit records created.');
    } catch (creditError) {
      console.error('!!! Error creating movie credits:', creditError);
    }
  }

  // ۸. واکشی مجدد فیلم با جزئیات کامل
  console.log('Fetching final created movie details...');
  const createdMovieWithDetails = await prisma.movie.findUnique({
    where: { id: newMovie.id },
    select: {
      // Select نهایی
      id: true,
      title: true,
      tmdbId: true,
      releaseDate: true,
      status: true,
      createdAt: true,
      imdbRating: true,
      rottenTomatoesScore: true,
      posterPath: true,
      backdropPath: true,
      description: true,
      runtime: true,
      trailerUrl: true,
      originalTitle: true,
      tagline: true,
      genres: { select: { id: true, name: true } },
      credits: {
        select: {
          role: true,
          characterName: true,
          person: { select: { id: true, name: true, imageUrl: true } },
        },
        // orderBy: { person: { popularity: 'desc' } } // مثال: مرتب‌سازی عوامل
      },
      addedBy: { select: { id: true, name: true, email: true } },
    },
  });

  console.log(`Movie creation process completed for TMDB ID: ${parsedTmdbId}`);
  return createdMovieWithDetails; // برگرداندن فیلم کامل
};

/*--------------------------------------------------*---------*/

/*--------------------------------------------------*---------*/
/*-------A service for delete a Movie Acording to role--------*/
/*--------------------------------------------------*---------*/
/**
 *  ---- Delete Service By checking user Access ----
 * @param {string} movieId    - Id of movie want remove
 * @param {object} user       - Object of logged In user (include id, role)
 * @return {Promise<boolean>} - In success true
 * @throws {Error | AppError} - In Error or Access denid
 */
export const deleteMovieService = async (movieId, user) => {
  console.log(
    `Attempting to delete movie ${movieId} by user ${user.id} (Role: ${user.role})`
  );
  // 1. Find movie and user added it
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    select: { id: true, title: true, addedById: true },
  });
  // 2. If not found Movie
  if (!movie) {
    console.log(`Movie with ID ${movieId} not found for deletion.`);
    throw new AppError('فیلم مورد نظر یافت نشد.', 404); // یا AppError(..., 404)
  }
  // 3. Check for Access To Delete
  const canDelete =
    user.role === Role.SUPER_ADMIN ||
    (user.role === Role.ADMIN && movie.addedById === user.id);
  if (!canDelete) {
    console.warn(
      `User ${user.id} (Role: ${user.role}) forbidden from deleting movie ${movieId} added by ${movie.addedById}`
    );
    throw new AppError('شما اجازه حذف این فیلم را ندارید.', 403); // یا AppError(..., 403) Forbidden
  }
  // 4. If Access to delete Remove Movie
  // Attention: for reson related onDelete: Cascade between Comment, Rating with delete Movie
  // also delete MovieCredit records remove if cascade defined
  try {
    await prisma.movie.delete({
      where: { id: movieId },
    });
    console.log(
      `Movie <span class="math-inline">\{movieId\} \(</span>{movie.title}) deleted successfully by user ${user.id}.`
    );
    return true;
  } catch (error) {
    console.error(`Error deleting movie ${movieId}:`, error);
    // throw new AppError('خطا در حذف فیلم از دیتابیس.', 500);
    throw error; // ارسال به errorHandler
  }
};
/*--------------------------------------------------*---------*/
/*--------------A service for get a Movie By id---------------*/
/*--------------------------------------------------*---------*/
/**
 * a service for get movie details By Id
 * @param {string} movieId
 * @returns {Promise<object | null>}
 */
export const getMovieByIdService = async (movieId) => {
  console.log('Fetching details for movie ID: ', movieId);
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      select: {
        id: true,
        title: true,
        tmdbId: true,
        releaseDate: true,
        status: true,
        createdAt: true,
        imdbRating: true,
        rottenTomatoesScore: true,
        posterPath: true,
        backdropPath: true,
        description: true,
        runtime: true,
        trailerUrl: true,
        originalTitle: true,
        tagline: true,
        originalLanguage: true,
        popularity: true,
        imdbId: true,
        adult: true,

        genres: { select: { id: true, name: true, tmdbId: true } }, // ژانرها
        credits: {
          // عوامل
          select: {
            role: true,
            characterName: true,
            person: {
              select: { id: true, name: true, imageUrl: true, tmdbId: true },
            },
          },
          // orderBy: { /* Optional: order credits if needed */ }
        },
        addedBy: { select: { id: true, name: true, email: true } },
      },
    });
    if (!movie) {
      throw new AppError('فیلم مورد نظر یافت نشد.', 404);
    }
    console.log(`Movie details found for ID: ${movieId}`);
    return movie;
  } catch (error) {
    console.error(`Error fetching movie ${movieId}:`, error);
    throw error;
  }
};
/*--------------------------------------------------*---------*/
/*--------------A service for update a Movie By id------------*/
/*--------------------------------------------------*---------*/
/**
 * Update a movie service
 * @param {string} movieId
 * @param {object} updateData
 * @param {object} user -user updating movie
 * @return {Promise<object>}
 * @throws {Error | AppError}
 */

export const updateMovieService = async (movieId, updateData, user) => {
  console.log(
    `Attempting to update movie ${movieId} by user ${user.id} (Role: ${user.role})`
  );
  console.log(
    'CHECKING PRISMA in updateMovieService:',
    typeof prisma,
    prisma ? 'OK' : '!!! UNDEFINED !!!'
  );
  // 1. Find movie for Update
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    select: { id: true, addedById: true },
  });
  if (!movie) {
    throw new Error('فیلم مورد نظر برای آپدیت یافت نشد.');
  }
  // 2. Check User alow update this Movie :
  // Note: only if user Role is SuperAdmin Or user is adding this movie can update movie
  const canUpdate =
    user.role === Role.SUPER_ADMIN ||
    (user.role === Role.ADMIN && movie.addedById === user.id);
  if (!canUpdate) {
    throw new Error('شما اجازه ویرایش این فیلم را ندارید.'); // 403 Forbidden
  }
  // 3. preparing valid data for Update
  // Note: Fields that come from updateData and are allowed in the schema
  const directUpdateData = {};
  const relationUpdates = {};
  const allowedFields = [
    'title',
    'originalTitle',
    'tagline',
    'description',
    'releaseDate',
    'runtime',
    'status',
    'originalLanguage',
    'popularity',
    'imdbId',
    'adult',
    'posterPath',
    'backdropPath',
    'trailerUrl',
    'imdbRating',
    'rottenTomatoesScore',
  ];
  for (const key of Object.keys(updateData)) {
    if (allowedFields.includes(key)) {
      if (
        key === 'status' &&
        updateData.status &&
        Object.values(MovieStatus).includes(updateData.status)
      ) {
        directUpdateData.status = MovieStatus[updateData.status];
      } // تبدیل تاریخ رشته‌ای به Date
      else if (key === 'releaseDate' && updateData.releaseDate) {
        try {
          directUpdateData.releaseDate = new Date(updateData.releaseDate);
        } catch (e) {
          console.error(
            'Invalid date format for releaseDate'
          ); /* نادیده بگیر یا خطا بده؟ */
        }
      }
      // تبدیل اعداد رشته‌ای (اگر از فرم آمده باشند)
      else if (key === 'runtime' && updateData.runtime)
        directUpdateData.runtime = parseInt(updateData.runtime, 10) || null;
      else if (key === 'popularity' && updateData.popularity)
        directUpdateData.popularity = parseFloat(updateData.popularity) || null;
      else if (key === 'imdbRating' && updateData.imdbRating)
        directUpdateData.imdbRating = parseFloat(updateData.imdbRating) || null;
      else if (key === 'rottenTomatoesScore' && updateData.rottenTomatoesScore)
        directUpdateData.rottenTomatoesScore =
          parseInt(updateData.rottenTomatoesScore, 10) || null;
      else if (key === 'adult')
        directUpdateData.adult = Boolean(updateData.adult);
      // برای سایر فیلدها که رشته‌ای هستند
      else if (
        typeof updateData[key] === 'string' ||
        typeof updateData[key] === 'number' ||
        typeof updateData[key] === 'boolean'
      ) {
        directUpdateData[key] = updateData[key];
      } else if (updateData[key] !== undefined) {
        directUpdateData[key] = updateData[key];
      }

      // if (allowedFields.includes(key))
    } else if (key === 'genreIds' && Array.isArray(updateData.genreIds)) {
      // از عملگر set برای جایگزینی کامل ژانرهای متصل استفاده می‌کنیم
      relationUpdates.genres = {
        set: updateData.genreIds.map((id) => ({ id: id })),
      };
      console.log(
        `Preparing to set genres for movie ${movieId} to IDs:`,
        updateData.genreIds
      );
    }
    // for
  }
  // TODO: Handle updating relations like genres and credits separately if needed.
  // This current implementation only updates direct fields on the Movie model.
  if (
    Object.keys(directUpdateData).length === 0 &&
    Object.keys(relationUpdates).length === 0
  ) {
    throw new Error('هیچ داده معتبری برای به‌روزرسانی ارائه نشده است.'); // 400
  }
  // 4. Movie Updating in dataBase
  console.log(
    `Updating movie ${movieId} with direct data:`,
    directUpdateData,
    'and relation updates:',
    relationUpdates
  );
  try {
    const finalUpdateData = { ...directUpdateData, ...relationUpdates };
    console.log('--- Final Data for prisma.movie.update ---');
    console.log(JSON.stringify(finalUpdateData, null, 2));
    const updatedMovie = await prisma.movie.update({
      where: { id: movieId },
      data: finalUpdateData,
      select: {
        // بازگرداندن فیلم آپدیت شده با فیلدهای لازم
        id: true,
        title: true,
        tmdbId: true,
        releaseDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        imdbRating: true,
        rottenTomatoesScore: true,
        posterPath: true,
        backdropPath: true,
        description: true,
        runtime: true,
        trailerUrl: true,
        genres: { select: { id: true, name: true } },
        credits: {
          select: {
            role: true,
            characterName: true,
            person: { select: { id: true, name: true, imageUrl: true } },
          },
        },
        addedBy: { select: { id: true, name: true, email: true } },
      },
    });
    console.log(`Movie ${movieId} updated successfully.`);
    return updatedMovie;
  } catch (error) {
    console.error(`Error updating movie ${movieId} in DB:`, error);
    // throw new AppError("خطا در به‌روزرسانی فیلم در دیتابیس.", 500);
    throw error;
  }
};
/**
 * Service for upload/replace movie pictur (poster or backdop)
 * @param {string} movieId
 * @param {string} userId
 * @param {Role} userRole
 * @param {Express.Multer.file} fileObject
 * @param {'poster'|'backdrop'} imageType
 * @returns {Promise<object>}
 */

export const updateMovieImageService = async (
  movieId,
  userId,
  userRole,
  fileObject,
  imageType
) => {
  console.log(
    `Attempting to update ${imageType} for movie ${movieId} by user ${userId}`
  );
  // 1. find movie for check access
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    select: { id: true, addedById: true },
  });
  if (!movie) {
    throw new Error('فیلم مورد نظر یافت نشد');
  }
  // 2. check for user Access to update -> admin added movie or super admin
  const canUpdate =
    userRole === Role.SUPER_ADMIN ||
    (userRole === Role.ADMIN && movie.addedById === userId);
  if (!canUpdate) {
    throw new Error('شما اجازه ویرایش این فیلم را ندارید'); //403
  }
  // 3. Inside function for upload to cloudinary
  const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
      const folder =
        imageType === 'poster' ? 'parsflix_posters' : 'parsflix_backdrops';
      const public_id = `movie_${movieId}_${imageType}`;
      console.log(
        `Uploading to Cloudinary folder: ${folder}, public_id: ${public_id}`
      );
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: public_id,
          overwrite: true /*, resource_type: 'auto' */,
        },
        (error, result) => {
          console.log('--- Cloudinary Image Update Callback Executed ---');
          console.log('Error:', JSON.stringify(error, null, 2));
          console.log('Result:', JSON.stringify(result, null, 2));
          if (error)
            return reject(
              new Error(
                `Cloudinary Upload Error: ${error.message || 'Unknown error'}`
              )
            );
          if (!result || !result.secure_url)
            return reject(new Error('آپلود کلودیناری نتیجه معتبری برنگرداند.'));
          resolve(result);
        }
      );
      uploadStream.on('error', (streamError) =>
        reject(new Error(`Cloudinary Stream Error: ${streamError.message}`))
      );
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  };
  // 4. Upload image to Cloudinary
  try {
    console.log(`Uploading ${imageType} to Cloudinary...`);
    const uploadResult = await uploadToCloudinary(fileObject.buffer);
    const newImageUrl = uploadResult.secure_url;
    console.log(`${imageType} uploaded successfully: ${newImageUrl}`);
    // 5. Update movie record in DB
    const fieldToUpdate =
      imageType === 'poster' ? 'posterPath' : 'backdropPath';
    const updatedMovie = await prisma.movie.update({
      where: { id: movieId },
      data: { [fieldToUpdate]: newImageUrl },
      select: {
        // Select کامل برای بازگشت به کلاینت
        id: true,
        title: true,
        tmdbId: true,
        releaseDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        imdbRating: true,
        rottenTomatoesScore: true,
        posterPath: true,
        backdropPath: true,
        description: true,
        runtime: true,
        trailerUrl: true,
        originalTitle: true,
        tagline: true,
        genres: { select: { id: true, name: true } },
        credits: {
          select: {
            role: true,
            characterName: true,
            person: { select: { id: true, name: true, imageUrl: true } },
          },
        },
        addedBy: { select: { id: true, name: true, email: true } },
      },
    });
    console.log(`Movie ${movieId} ${fieldToUpdate} updated in DB.`);
    return updatedMovie;
  } catch (error) {
    console.error(`Error in updateMovieImageService for ${imageType}:`, error);
    throw new AppError(error.message || `خطا در آپلود ${imageType}`, 500); // 500
  }
};
