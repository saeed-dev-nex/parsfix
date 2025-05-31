import express from 'express';
import {
  getPublicMoviesList,
  getPublicMovieDetails,
  getMovieFilterOptionsController,
  getNewestMoviesSliderController,
} from '../../controllers/public/publicMovieController.js';

const router = express.Router();

// این روت‌ها عمومی هستند و نیازی به احراز هویت ادمین ندارند
router.get('/', getPublicMoviesList);
router.get('/filter-options', getMovieFilterOptionsController);
router.get('/:idOrTmdbIdOrSlug', getPublicMovieDetails);
router.get('/newest-movies-slider', getNewestMoviesSliderController);

export default router;
