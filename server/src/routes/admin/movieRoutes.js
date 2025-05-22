import express from 'express';
import { protect, restrictTo } from '../../middlewares/authMiddleware.js';
import {
  createMovieController,
  deleteMovieController,
  getAllMoviesController,
  getMovieByIdController,
  searchTmdbController,
  updateMovieBackdropController,
  updateMovieController,
  updateMoviePosterController,
} from '../../controllers/admin/movieController.js';
import { Role } from '@prisma/client';
import { validate } from '../../middlewares/validationMiddleware.js';
import {
  createMovieSchema,
  updateMovieSchema,
} from '../../validations/movieValidation.js';
import upload from '../../middlewares/uploadMiddleware.js';

const router = express.Router();
// All routes in this router are protected and login is require  and restricted to admin and super admins
router.use(protect);

// -----------------------------------------------------------------
// @desc    Get all movies
router.get(
  '/',
  restrictTo(Role.ADMIN, Role.SUPER_ADMIN),
  getAllMoviesController
);
router.get(
  '/tmdb/search',
  restrictTo(Role.ADMIN, Role.SUPER_ADMIN),
  searchTmdbController
);
router.get('/:id', getMovieByIdController);
router.post(
  '/',
  restrictTo(Role.ADMIN, Role.SUPER_ADMIN),
  createMovieController
); // فعلا بدون ولیدیشن
router.put(
  '/:id',
  restrictTo(Role.ADMIN, Role.SUPER_ADMIN),
  validate(updateMovieSchema),
  updateMovieController
);
router.put(
  '/:id/poster',
  protect,
  upload.single('posterImage'),
  updateMoviePosterController
);
router.put(
  '/:id/backdrop',
  protect,
  upload.single('backdropImage'),
  updateMovieBackdropController
);

router.delete(
  '/:id',
  restrictTo(Role.ADMIN, Role.SUPER_ADMIN),
  validate(createMovieSchema),
  deleteMovieController
);
export default router;
