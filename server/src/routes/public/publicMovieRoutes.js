import express from 'express';
import {
  getPublicMoviesList,
  getPublicMovieDetails,
} from '../../controllers/public/publicMovieController.js';

const router = express.Router();

// این روت‌ها عمومی هستند و نیازی به احراز هویت ادمین ندارند
router.get('/', getPublicMoviesList);
router.get('/:idOrTmdbIdOrSlug', getPublicMovieDetails);

export default router;
