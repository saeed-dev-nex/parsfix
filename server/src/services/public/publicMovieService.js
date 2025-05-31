/**
 *  service for get list of public movies Published status
 * @param {object} options - Options object {page, limit, sortBy, sortOrder, genreId, search}
 * @param {number} options.page - Page number for pagination (default: 1)
 * @param {number} options.limit - Number of movies per page (default: 20)
 * @param {string} options.sortBy - Field to sort by (default: 'popularity')
 * @param {'asc'|'desc'} options.sortOrder - Sort order ('asc' or 'desc', default: 'desc')
 * @param {string} options.genreId - Filter by genre ID (default: null)
 * @param {string|null} options.search - Search query (default: null)
 * @param {string|null} options.country - Filter by country (default: null)
 * @param {number|null} options.year - Filter by release year (default: null)
 * @param {number|null} options.minImdbRating - Filter by minimum IMDb rating (default: null)
 * @returns {Promise<object>} - Promise that resolves to an array of movie objects
 */
export const getPublicMoviesService = async ({
  page = 1,
  limit = 20,
  sortBy = 'popularity',
  sortOrder = 'desc',
  genreId = null,
  search = null,
  country = null,
  year = null,
  minImdbRating = null,
}) => {
  console.log(
    `[Public Service] Fetching movies list with options:, ${
      (page,
      limit,
      sortBy,
      sortOrder,
      genreId,
      search,
      country,
      year,
      minImdbRating)
    }`
  );
  try {
    const skip = (page - 1) * limit;
    const take = parseInt(limit, 10);
    if (isNaN(take) || take <= 0)
      throw new AppError('مقدار limit نامعتبر است.', 400);

    const allowedSortFields = [
      'title',
      'releaseDate',
      'popularity',
      'imdbRating',
      'rottenTomatoesScore',
      'createdAt',
    ]; // related fields to movies
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : 'popularity';
    const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    let whereCondition = {
      status: {
        in: [MovieStatus.PUBLISHED, MovieStatus.ARCHIVED], // Only published or archived movies
      },
      posterPath: { not: null }, // Must have a poster
    };

    // Optional filters
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerm = search.trim();
      whereCondition.OR = [
        { title: { contains: searchTerm /*, mode: 'insensitive' */ } },
        { originalTitle: { contains: searchTerm /*, mode: 'insensitive' */ } },
        { description: { contains: searchTerm /*, mode: 'insensitive' */ } },
      ];
    }
    if (genreId && typeof genreId === 'string') {
      whereCondition.genres = { some: { id: genreId } };
    }
    if (year && !isNaN(parseInt(year, 10))) {
      const numericYear = parseInt(year, 10);
      const startDate = new Date(numericYear, 0, 1); // January 1st of the year
      const endDate = new Date(numericYear + 1, 0, 1); // January 1st of the next year
      whereCondition.releaseDate = { gte: startDate, lt: endDate };
    }
    if (minImdbRating && !isNaN(parseFloat(minImdbRating))) {
      whereCondition.imdbRating = { gte: parseFloat(minImdbRating) };
    }
    if (country && typeof country === 'string' && country.trim() !== '') {
      // فرض: شما یک فیلد countryOfOrigin: String? در مدل Movie دارید
      // یا یک رابطه چند به چند با مدل Country
      whereCondition.countryOfOrigin = {
        contains: country.trim() /*, mode: 'insensitive' */,
      };
    }

    const movies = await prisma.movie.findMany({
      where: whereCondition,
      skip: skip,
      take: take,
      orderBy: { [safeSortBy]: safeSortOrder },
      select: {
        // fields necessary for public movie cards
        id: true,
        tmdbId: true,
        title: true,
        description: true, // خلاصه
        posterPath: true,
        releaseDate: true,
        runtime: true,
        status: true,
        imdbRating: true,
        rottenTomatoesScore: true,
        genres: { select: { id: true, name: true } },
        // _count: { select: { ratings: true } } // User ratings (if available)
      },
    });

    const totalMovies = await prisma.movie.count({ where: whereCondition });
    const totalPages = Math.ceil(totalMovies / take);

    console.log(
      `[Public Service] Found ${movies.length} public movies (Total: ${totalMovies})`
    );
    return {
      movies,
      totalMovies,
      totalPages,
      currentPage: parseInt(page, 10),
      limit: take,
    };
  } catch (error) {
    console.error('[Public Service] Error fetching public movies list:', error);
    throw new AppError('خطا در واکشی لیست فیلم‌ها برای نمایش عمومی.', 500);
  }
};

/**
 * سرویس برای دریافت گزینه‌های فیلتر فیلم‌ها (ژانرها، سال‌ها و...)
 */
export const getMovieFilterOptionsService = async () => {
  console.log('[Public Movie Service] Fetching filter options...');
  try {
    const genresPromise = prisma.genre.findMany({
      where: {
        movies: {
          some: {
            status: { in: [MovieStatus.PUBLISHED, MovieStatus.ARCHIVED] },
          },
        },
      }, // فقط ژانرهایی که فیلم منتشر شده دارند
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    // واکشی سال‌های منحصربفرد از فیلم‌های منتشر شده
    // این کوئری ممکن است برای دیتابیس‌های بزرگ سنگین باشد
    const yearsPromise = prisma.movie.groupBy({
      by: ['releaseDate'], // گروه بندی بر اساس تاریخ کامل
      where: {
        status: { in: [MovieStatus.PUBLISHED, MovieStatus.ARCHIVED] },
        releaseDate: { not: null },
      },
      orderBy: { releaseDate: 'desc' },
    });

    // واکشی کشورهای منحصربفرد (اگر فیلد countryOfOrigin دارید)
    const countriesPromise = prisma.movie.findMany({
      where: {
        status: { in: [MovieStatus.PUBLISHED, MovieStatus.ARCHIVED] },
        countryOfOrigin: { not: null, not: '' },
      },
      distinct: ['countryOfOrigin'],
      select: { countryOfOrigin: true },
      orderBy: { countryOfOrigin: 'asc' },
    });

    const [genres, distinctYearDates, distinctCountries] = await Promise.all([
      genresPromise,
      yearsPromise,
      countriesPromise,
    ]);

    // استخراج سال‌های منحصربفرد از تاریخ‌ها
    const uniqueYears = [
      ...new Set(
        distinctYearDates.map((item) =>
          new Date(item.releaseDate).getFullYear()
        )
      ),
    ].sort((a, b) => b - a); // مرتب‌سازی نزولی سال‌ها

    const uniqueCountries = distinctCountries
      .map((c) => c.countryOfOrigin)
      .filter(Boolean)
      .sort();

    const filterOptions = {
      genres,
      years: uniqueYears,
      countries: uniqueCountries,
      // می‌توانید رنج امتیاز IMDb را هم اضافه کنید
    };
    console.log(
      '[Public Movie Service] Filter options fetched:',
      filterOptions
    );
    return filterOptions;
  } catch (error) {
    console.error(
      '[Public Movie Service] Error fetching filter options:',
      error
    );
    throw new AppError('خطا در واکشی گزینه‌های فیلتر.', 500);
  }
};

/**
 *
 * @param {string} id  - ID of the movie or TMDB ID
 * @returns {Promise<object>} - Promise that resolves to an object containing movie details
 */
export const getPublicMovieDetailsByIdService = async (id) => {
  console.log(
    `[Public Service] Fetching public details for movie ID/TMDB_ID/Slug: ${id}`
  );
  try {
    let whereClause;
    // Determine the type of identifier (CUID internal ID, or TMDB ID numeric, or Slug string)
    if (!isNaN(parseInt(id, 10))) {
      // If it's a number, it's a TMDB ID
      whereClause = { tmdbId: parseInt(id, 10) };
    } else if (id.length === 25 && !id.includes('-')) {
      // Assuming CUID (25 characters without a dash)
      whereClause = { id: id };
    } else {
      // otherwise, assume it's a Slug
      whereClause = { slug: id }; // <-- if you added slug field to Movie model
      // If you don't have a slug, limit this section to internal id or tmdbId
    }
    // If you don't have a slug, you can only search by id or tmdbId:
    // const whereClause = isNaN(parseInt(id, 10)) ? { id: id } : { tmdbId: parseInt(id, 10) };

    const movie = await prisma.movie.findUnique({
      where: whereClause,
      select: {
        // Select necessary fields for public details page
        id: true,
        tmdbId: true,
        title: true,
        originalTitle: true,
        tagline: true,
        description: true,
        releaseDate: true,
        runtime: true,
        status: true,
        originalLanguage: true,
        popularity: true,
        imdbId: true,
        adult: true,
        posterPath: true,
        backdropPath: true,
        trailerUrl: true,
        imdbRating: true,
        rottenTomatoesScore: true,
        genres: { select: { id: true, name: true, imageUrl: true } },
        credits: {
          // only main cast and crew
          where: {
            OR: [{ role: CreditType.ACTOR }, { role: CreditType.DIRECTOR }],
          },
          take: 15, // e.g. 15 main cast and crew

          select: {
            role: true,
            characterName: true,
            person: { select: { id: true, name: true, imageUrl: true } },
          },
          // orderBy: { /* ... */ }
        },
        // comments: { select: { text: true, user: { select: { name: true } }, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 10 },
        // ratings: { select: { score: true } } // امتیاز کاربران شما (اگر دارید)
      },
    });

    if (!movie) {
      throw new AppError(`فیلمی با شناسه '${id}' یافت نشد.`, 404);
    }

    // Check movie status for public display
    const publiclyVisibleStatuses = [
      MovieStatus.PUBLISHED,
      MovieStatus.ARCHIVED,
    ];
    if (!publiclyVisibleStatuses.includes(movie.status)) {
      throw new AppError(
        'این فیلم در حال حاضر برای نمایش عمومی در دسترس نیست.',
        403
      ); //  404
    }

    console.log(`[Public Service] Public movie details found for '${id}'`);
    return movie;
  } catch (error) {
    console.error(
      `[Public Service] Error fetching public movie details for '${id}':`,
      error
    );
    if (error instanceof AppError) throw error;
    if (
      error.code === 'P2025' &&
      error instanceof prisma.PrismaClientKnownRequestError
    ) {
      // If using findUniqueOrThrow
      throw new AppError(`فیلمی با شناسه '${id}' یافت نشد.`, 404);
    }
    throw new AppError('خطا در واکشی جزئیات فیلم برای نمایش عمومی.', 500);
  }
};

/**
 * دریافت جدیدترین فیلم‌های منتشر شده برای اسلایدر
 */
export const getNewestMoviesSliderService = async (limit = 10) => {
  console.log('[ContentService] Fetching newest movies for slider...');
  try {
    const movies = await prisma.movie.findMany({
      where: {
        status: MovieStatus.PUBLISHED,
        posterPath: { not: null },
        backdropPath: { not: null },
      },
      orderBy: { releaseDate: 'desc' }, // یا createdAt
      take: limit,
      select: {
        /* ... فیلدهای لازم برای اسلایدر کلاینت (مشابه MediaItem) ... */
        id: true,
        title: true,
        backdropPath: true,
        releaseDate: true,
        tagline: true,
        genres: { select: { name: true } },
      },
    });
    // می‌توانید از mapToMediaItem هم استفاده کنید
    return movies
      .map((m) => mapToMediaItem(m, 'movie'))
      .filter((item) => item !== null);
  } catch (error) {
    throw new AppError('خطا در واکشی جدیدترین فیلم‌ها.', 500);
  }
};
