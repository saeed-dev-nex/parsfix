import {
  getPublicSeriesDetailsService,
  getPublicSeriesService,
} from '../../services/public/publicSeriesService.js';

/**
 * کنترلر برای دریافت لیست سریال‌های عمومی
 */
export const getPublicSeriesList = async (req, res, next) => {
  console.log('--- Entered getPublicSeriesList Controller ---');
  try {
    const { page, limit, sortBy, sortOrder, genreId, search } = req.query;
    const result = await getPublicSeriesService({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy: sortBy,
      sortOrder: sortOrder,
      // genreId: genreId as string,
      // search: search as string,
    });
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * کنترلر برای دریافت جزئیات یک سریال عمومی
 */
export const getPublicSeriesDetails = async (req, res, next) => {
  console.log(
    `--- Entered getPublicSeriesDetails Controller for ID: ${req.params.idOrTmdbId} ---`
  );
  try {
    const id = req.params.idOrTmdbId; // می‌تواند ID داخلی یا TMDB ID باشد
    if (!id) {
      throw new AppError('شناسه سریال مشخص نشده است.', 400);
    }
    const series = await getPublicSeriesDetailsService(id);
    res.status(200).json({ status: 'success', data: { series } });
  } catch (error) {
    next(error);
  }
};
