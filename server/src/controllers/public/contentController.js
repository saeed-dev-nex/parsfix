import {
  getHeroSliderItemsService,
  getTrendingMoviesService,
  getRecommendedShowsService,
  getFeaturedItemService,
  getTop10MoviesService,
  getTop10SeriesService,
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
