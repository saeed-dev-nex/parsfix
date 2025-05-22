import express from 'express';
import { protect, restrictTo } from '../../middlewares/authMiddleware.js';
import { validate } from '../../middlewares/validationMiddleware.js';
import { updateEpisodeSchema } from '../../validations/episodeValidation.js'; // ایمپورت schema
import {
  updateEpisodeController,
  uploadEpisodeStillController,
} from '../../controllers/admin/episodeController.js';
import upload from '../../middlewares/uploadMiddleware.js'; // multer
import { Role } from '@prisma/client';

const router = express.Router();

router.use(protect);
// restrictTo در سرویس‌ها چک می‌شود

// روت آپدیت اطلاعات پایه قسمت
router.put(
  '/:id',
  restrictTo(Role.ADMIN, Role.SUPER_ADMIN),
  validate(updateEpisodeSchema),
  updateEpisodeController
);

// روت آپدیت عکس صحنه (Still) قسمت
router.put(
  '/:id/still',
  restrictTo(Role.ADMIN, Role.SUPER_ADMIN),
  upload.single('stillImage'),
  uploadEpisodeStillController
); // نام فیلد: stillImage

export default router;
