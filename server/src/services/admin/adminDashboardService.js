import { MovieStatus, Role, SeriesStatus } from '@prisma/client';
import Prisma from '../../config/db.js';
import prisma from '../../config/db.js';

/**
 * @description This function calculates various statistics for the admin dashboard.
 * It retrieves counts of movies, series, genres, persons, and users based on the user's role.
 * It also counts the number of published and pending movies.
 * @function getDashboardStatsService
 * @async
 * @param {Object} user - The user object containing user information.
 * @returns {Promise<object>} - A promise that resolves to an object containing the calculated statistics.
 * @throws {Error} - Throws an error if the user role is not authorized or if there is an error during the calculation.
 * */
export const getDashboardStatsService = async (user) => {
  console.log(
    `calculating dashboard stats for user: ${user.id} : {Role: ${user.role}}`
  );
  try {
    const { id: userId, role: userRole } = user;
    // Base Reports without dependency on user role
    const totalMovieCountPromise = Prisma.movie.count();
    const totalSeriesCountPromise = Prisma.series.count();
    const totalGenreCountPromise = Prisma.genre.count();
    const totalPersonCountPromise = Prisma.person.count();
    const totalPublishedMovieCountPromise = Prisma.movie.count({
      where: { status: MovieStatus.PUBLISHED },
    });
    const totalPublishedSeriesCountPromise = prisma.series.count({
      where: { status: SeriesStatus.PUBLISHED },
    });
    //Query depending on user role
    let userCountPromise;
    let adminCountPromise;
    let PendingMovieCountPromise;
    let pendingSeriesCountPromise;
    if (userRole === Role.SUPER_ADMIN) {
      userCountPromise = Prisma.user.count({
        where: { role: Role.USER },
      });
      adminCountPromise = Prisma.user.count({
        where: { role: Role.ADMIN },
      });
      PendingMovieCountPromise = Prisma.movie.count({
        where: { status: MovieStatus.PENDING },
      });
      pendingSeriesCountPromise = prisma.series.count({
        where: { status: SeriesStatus.PENDING },
      });
    } else if (userRole === Role.ADMIN) {
      userCountPromise = Prisma.user.count({
        where: { role: Role.USER },
      });

      PendingMovieCountPromise = Prisma.movie.count({
        where: { status: MovieStatus.PENDING, addedById: userId },
      });
      pendingSeriesCountPromise = prisma.series.count({
        where: { status: SeriesStatus.PENDING, addedById: userId },
      });
    } else {
      throw new Error('دسترسی غیرمجاز برای دریافت آمار.');
    }
    // Execute all promises in parallel
    const [
      MoviesCount,
      SeriesCount,
      GenreCount,
      PersonCount,
      PublishedMovieCount,
      PublishedSeriesCount,
      userCountNormal,
      userCountAdmin,
      PendingMovieCount,
      pendingSeriescCount,
    ] = await Promise.all([
      totalMovieCountPromise,
      totalSeriesCountPromise,
      totalGenreCountPromise,
      totalPersonCountPromise,
      totalPublishedMovieCountPromise,
      totalPublishedSeriesCountPromise,
      userCountPromise,
      adminCountPromise,
      PendingMovieCountPromise,
      pendingSeriesCountPromise,
    ]);
    //  create an Object for the stats results
    const stats = {
      moviesCount: MoviesCount,
      seriesCount: SeriesCount,
      genreCount: GenreCount,
      personCount: PersonCount,
      publishedMovieCount: PublishedMovieCount,
      PublishedSeriesCount: PublishedSeriesCount,
      pendingMovieCount: PendingMovieCount,
      pendingSeriescCount: pendingSeriescCount,
      userCountNormal,
    };
    // Add spacific stats  super admin
    if (userRole === Role.SUPER_ADMIN) {
      stats.userCountAdmin = userCountAdmin;
      stats.userCountTotal = userCountNormal + userCountAdmin;
    }
    console.log('Dashboard stats calculated:', stats);
    return stats;
  } catch (error) {
    console.error('Error calculating dashboard stats:', error);
    throw new Error('خطا در محاسبه آمار داشبورد.');
  }
};

/**
 * @description This function retrieves recent activities for the admin dashboard.
 * It fetches the recent activities based on the user's role.
 * @function getRecentActivitiesService
 * @async
 * @param {Object} user - The user object containing user information.
 * @returns {Promise<void>} - A promise that resolves when the recent activities are fetched.
 * @throws {Error} - Throws an error if the user role is not authorized or if there is an error during the fetching.
 *
 */
export const getRecentActivitiesService = async (user) => {
  console.log(
    `Fetching recent activities for user ${user.id} (Role: ${user.role})`
  );
  try {
    const takeLimit = 10; // Limit for recent activities
    // Fetch Last users Added
    const recentUsersPromise = Prisma.user.findMany({
      where: { role: Role.USER },
      orderBy: { createdAt: 'desc' },
      take: takeLimit,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    // fetch Last Movies Added
    let MovieWhereCondition = {};
    let SeriesWhereConditions = {};
    // if Role is Admin show Last Movies Added by the Admin but now fetch all movies
    const recentMoviesPromise = Prisma.movie.findMany({
      where: MovieWhereCondition,
      orderBy: { createdAt: 'desc' },
      take: takeLimit,
      select: {
        id: true,
        title: true,
        createdAt: true,
        status: true,
        addedBy: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
    const recentSeriesPromise = prisma.series.findMany({
      where: SeriesWhereConditions,
      orderBy: { createdAt: 'desc' },
      take: takeLimit,
      select: {
        id: true,
        title: true,
        createdAt: true,
        status: true,
        addedBy: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
    const [recentUsers, recentMovies, recentSeries] = await Promise.all([
      recentUsersPromise,
      recentMoviesPromise,
      recentSeriesPromise,
    ]);
    return { recentUsers, recentMovies, recentSeries };
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw new Error('خطا در دریافت فعالیت‌های اخیر.');
  }
};
