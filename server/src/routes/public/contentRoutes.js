import express from 'express';
import {
  getHeroSliderItemsController,
  getTrendingMoviesController,
  getRecommendedShowsController,
  getFeaturedItemController,
  getTop10MoviesController,
  getTop10SeriesController,
  getUpcomingMoviesController,
  getUpcomingSeriesController,
} from '../../controllers/public/contentController.js'; // مسیر صحیح

const router = express.Router();

// این روت‌ها عمومی هستند
router.get('/hero-items', getHeroSliderItemsController);
router.get('/trending-movies', getTrendingMoviesController);
router.get('/recommended-shows', getRecommendedShowsController);
router.get('/featured-item', getFeaturedItemController);

router.get('/top-10-movies', getTop10MoviesController);
router.get('/top-10-series', getTop10SeriesController);

router.get('/upcoming-series', getUpcomingSeriesController);
router.get('/upcoming-movies', getUpcomingMoviesController);

export default router;
