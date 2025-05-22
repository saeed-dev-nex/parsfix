import express from 'express';
import { protect, restrictTo } from '../../middlewares/authMiddleware.js';
import {
  createSeriesController,
  deleteSeriesController,
  getAllSeriesController,
  getSeriesByIdController,
  searchTmdbSeriesController,
  updateSeriesController,
  uploadSeriesBackdropController,
  uploadSeriesPosterController,
} from '../../controllers/admin/seriesController.js';
import upload from '../../middlewares/uploadMiddleware.js';
import { validate } from '../../middlewares/validationMiddleware.js';
import { Role } from '@prisma/client';
import {
  createSeriesSchema,
  updateSeriesSchema,
} from '../../validations/seriesValidation.js';

const router = express.Router();
// روت‌های جدید آپلود عکس (قبل از restrictTo کلی)
router.put(
  '/:id/poster',
  protect,
  upload.single('posterImage'),
  uploadSeriesPosterController
);
router.put(
  '/:id/backdrop',
  protect,
  upload.single('backdropImage'),
  uploadSeriesBackdropController
);

// محافظت کلی برای تمام روت‌های سریال در پنل ادمین
router.use(protect);
router.use(restrictTo(Role.ADMIN, Role.SUPER_ADMIN));

router.post('/', validate(createSeriesSchema), createSeriesController);

router.get('/tmdb/search', searchTmdbSeriesController);
// روت دریافت لیست سریال‌ها
router.get('/', getAllSeriesController);
router.get('/:id', getSeriesByIdController);

router.delete('/:id', deleteSeriesController);

router.put('/:id', validate(updateSeriesSchema), updateSeriesController);

// TODO: Add POST /, GET /:id, PUT /:id, DELETE /:id routes later
// TODO: Add TMDB search/detail routes for series? e.g., router.get('/tmdb/search', ...)

export default router;
