import express from 'express';
import {
  getPublicSeriesList,
  getPublicSeriesDetails,
} from '../../controllers/public/publicSeriesController.js';
// این روت‌ها نیازی به protect یا restrictTo ندارند

const router = express.Router();

router.get('/', getPublicSeriesList); // لیست عمومی سریال‌ها
router.get('/:idOrTmdbId', getPublicSeriesDetails); // جزئیات عمومی یک سریال

export default router;
