import {
  getHeroSliderItemsService,
  getTrendingMoviesService,
  getRecommendedShowsService,
  getFeaturedItemService,
  getTop10MoviesService,
  getTop10SeriesService,
  getUpcomingSeriesService,
  getUpcomingMoviesService,
} from '../../services/public/contentService.js'; // مسیر صحیح

export const getHeroSliderItemsController = async (req, res, next) => {
  try {
    const items = await getHeroSliderItemsService();
    res.status(200).json({ status: 'success', data: { items } });
  } catch (error) {
    next(error);
  }
};

export const getTrendingMoviesController = async (req, res, next) => {
  try {
    const items = await getTrendingMoviesService(
      parseInt(req.query.limit || '10', 10)
    );
    res.status(200).json({ status: 'success', data: { items } });
  } catch (error) {
    next(error);
  }
};

export const getRecommendedShowsController = async (req, res, next) => {
  try {
    const items = await getRecommendedShowsService(
      parseInt(req.query.limit || '10', 10)
    );
    res.status(200).json({ status: 'success', data: { items } });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedItemController = async (req, res, next) => {
  try {
    const item = await getFeaturedItemService();
    res.status(200).json({ status: 'success', data: { item } });
  } catch (error) {
    next(error);
  }
};

export const getTop10MoviesController = async (req, res, next) => {
  try {
    const items = await getTop10MoviesService(
      parseInt(req.query.limit || '10', 10)
    );
    res.status(200).json({ status: 'success', data: { items } });
  } catch (error) {
    next(error);
  }
};

export const getTop10SeriesController = async (req, res, next) => {
  try {
    const items = await getTop10SeriesService(
      parseInt(req.query.limit || '10', 10)
    );
    res.status(200).json({ status: 'success', data: { items } });
  } catch (error) {
    next(error);
  }
};
export const getUpcomingSeriesController = async (req, res, next) => {
  try {
    const { limit, page } = req.query;
    const options = {};
    if (limit) options.limit = parseInt(limit, 10);
    if (page) options.page = parseInt(page, 10);

    const upcomingSeries = await getUpcomingSeriesService(options);
    res.status(200).json({
      status: 'success',
      results: upcomingSeries.length,
      data: {
        items: upcomingSeries,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingMoviesController = async (req, res, next) => {
  try {
    console.log('-------------- Begin upcoming movies controller ------------');

    const { limit, page } = req.query;
    const options = {};
    if (limit) options.limit = parseInt(limit, 10);
    if (page) options.page = parseInt(page, 10);

    const upcomingMovies = await getUpcomingMoviesService(options);
    console.log(
      `This is response get from upcoming movies service : [${upcomingMovies}]`
    );

    res.status(200).json({
      status: 'success',
      results: upcomingMovies.length,
      data: {
        items: upcomingMovies,
      },
    });
  } catch (error) {
    next(error);
  }
};
