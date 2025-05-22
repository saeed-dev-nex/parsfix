import prisma from '../../config/db.js';
/**
 * service for get list of all Genres
 * @param {object}  option
 * @returns {Promise<Array<object>>}
 */
export const getAllGenresService = async (options = {}) => {
  console.log('Fetching All Genres ...');
  try {
    const genres = await prisma.genre.findMany({
      select: {
        id: true,
        name: true,
        tmdbId: true,
        imageUrl: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    console.log(`Found ${genres.length} genres`);
    return genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    // throw new AppError("خطا در واکشی لیست ژانرها.", 500);
    throw error;
  }
};
