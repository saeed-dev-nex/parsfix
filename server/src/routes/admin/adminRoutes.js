import express from 'express';
import { protect, restrictTo } from '../../middlewares/authMiddleware.js';
import {
  blockUserAdminController,
  changeUserRoleAdminController,
  deleteUserAdminController,
  getAllUsersAdminController,
  getDashboardStatsController,
  getRecentActivitiesController,
  unblockUserAdminController,
} from '../../controllers/admin/adminController.js';
import { Role } from '@prisma/client';
import { changeRoleSchema } from '../../validations/adminValidation.js';
import { validate } from '../../middlewares/validationMiddleware.js';

const router = express.Router();
router.use(protect);
router.put(
  '/users/:id/role',
  restrictTo(Role.SUPER_ADMIN), // فقط سوپرادمین
  validate(changeRoleSchema), // ولیدیشن نقش جدید

  changeUserRoleAdminController
);

router.use(restrictTo(Role.SUPER_ADMIN, Role.ADMIN));

router.get('/stats', getDashboardStatsController);

router.get('/recent-activities', getRecentActivitiesController);
router.get('/users', getAllUsersAdminController);

router.put(
  '/users/:id/block',
  /* validate(blockUserSchema), */ blockUserAdminController
); // ولیدیشن اختیاری
router.put('/users/:id/unblock', unblockUserAdminController);

// Delete user
router.delete('/users/:id', deleteUserAdminController);
export default router;
