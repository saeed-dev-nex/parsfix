import express from 'express';
import {
  getHeroSliderItemsController,
  getTrendingMoviesController,
  getRecommendedShowsController,
  getFeaturedItemController,
  getTop10MoviesController,
  getTop10SeriesController,
} from '../../controllers/public/contentController.js'; // مسیر صحیح

const router = express.Router();

// این روت‌ها عمومی هستند
router.get('/hero-items', getHeroSliderItemsController);
router.get('/trending-movies', getTrendingMoviesController);
router.get('/recommended-shows', getRecommendedShowsController);
router.get('/featured-item', getFeaturedItemController);

router.get('/top-10-movies', getTop10MoviesController);
router.get('/top-10-series', getTop10SeriesController);

export default router;
