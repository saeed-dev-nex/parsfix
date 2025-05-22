/**
 *  service for get list of public movies Published status
 * @param {object} options - Options object {page, limit, sortBy, sortOrder, genreId, search}
 * @returns {Promise<object>} - Promise that resolves to an array of movie objects
 */
export const getPublicMoviesService = async ({
  page = 1,
  limit = 20,
  sortBy = 'popularity',
  sortOrder = 'desc',
  //   getGenreId = null,
  //   search = null
}) => {
  console.log(
    `[Public Service] Fetching movies list with options:, ${
      (page, limit, sortBy, sortOrder)
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

    // TODO: Add genreFilter or search logic to whereCondition

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
