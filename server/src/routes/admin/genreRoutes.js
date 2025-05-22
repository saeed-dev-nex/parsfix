import express from 'express';
import { protect, restrictTo } from '../../middlewares/authMiddleware.js';
import { Role } from '@prisma/client';
import { getAllGenresController } from '../../controllers/admin/genreController.js';
const router = express.Router();

router.get(
  '/',
  protect,
  restrictTo(Role.ADMIN, Role.SUPER_ADMIN),
  getAllGenresController
);
export default router;
