import { getPublicMovieDetailsByIdService, getPublicMoviesService } from '../../services/public/publicMovieService.js';
import AppError from '../../utils/AppError.js';

/**
 * کنترلر برای دریافت لیست فیلم‌های عمومی
 */
export const getPublicMoviesList = async (req, res, next) => {
  console.log('--- Entered getPublicMoviesList Controller ---');
  try {
    const { page, limit, sortBy, sortOrder /*, genreId, search */ } = req.query;
    const result = await getPublicMoviesService({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy: sortBy,
      sortOrder: sortOrder,
      // genreId: genreId as string, search: search as string,
    });
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * کنترلر برای دریافت جزئیات یک فیلم عمومی
 */
export const getPublicMovieDetails = async (req, res, next) => {
  console.log(
    `--- Entered getPublicMovieDetails Controller for ID: ${req.params.idOrTmdbIdOrSlug} ---`
  );
  try {
    const id = req.params.idOrTmdbIdOrSlug; // می‌تواند ID داخلی، TMDB ID یا Slug باشد
    if (!id) {
      throw new AppError('شناسه فیلم مشخص نشده است.', 400);
    }
    const movie = await getPublicMovieDetailsByIdService(id);
    res.status(200).json({ status: 'success', data: { movie } });
  } catch (error) {
    next(error);
  }
};
