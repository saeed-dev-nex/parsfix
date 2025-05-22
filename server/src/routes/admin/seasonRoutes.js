import express from 'express';
import { protect, restrictTo } from '../../middlewares/authMiddleware.js';
import { validate } from '../../middlewares/validationMiddleware.js';
import { updateSeasonSchema } from '../../validations/seasonValidation.js'; // ایمپورت schema
import {
  updateSeasonController,
  uploadSeasonPosterController,
} from '../../controllers/admin/seasonController.js';
import { Role } from '@prisma/client';
import upload from '../../middlewares/uploadMiddleware.js';
const router = express.Router();

// دسترسی به تمام روت‌های فصل نیازمند ادمین بودن است
router.use(protect);
router.use(restrictTo(Role.ADMIN, Role.SUPER_ADMIN)); // یا فقط سوپرادمین؟

// روت آپدیت فصل
router.put('/:id', validate(updateSeasonSchema), updateSeasonController);
// روت آپدیت اطلاعات پایه فصل
router.put(
  '/:id',
  restrictTo(Role.ADMIN, Role.SUPER_ADMIN),
  validate(updateSeasonSchema),
  updateSeasonController
);

// روت آپدیت پوستر فصل
router.put(
  '/:id/poster',
  restrictTo(Role.ADMIN, Role.SUPER_ADMIN),
  upload.single('posterImage'),
  uploadSeasonPosterController
);

// TODO: Add route for PUT /:id/poster
// TODO: Add routes for GET /:id/episodes, POST /:id/episodes, etc.

export default router;
