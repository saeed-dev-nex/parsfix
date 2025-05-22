import prisma from '../../config/db.js';
import {
  getDashboardStatsService,
  getRecentActivitiesService,
} from '../../services/admin/adminDashboardService.js';
import {
  blockUserService,
  changeUserRoleAdminService,
  deleteUserAdminService,
  getAllUsersAdminService,
  unblockUserService,
} from '../../services/admin/userAdminService.js';

export const getDashboardStatsController = async (req, res, next) => {
  console.log('--- Entered getDashboardStatsController ---');
  try {
    const stats = await getDashboardStatsService(req.user);
    console.log('--- Dashboard Stats ---', stats);
    if (!stats) {
      return res.status(404).json({
        status: 'fail',
        message: 'آمار داشبورد پیدا نشد.',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'آمار داشبورد با موفقیت دریافت شد.',
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentActivitiesController = async (req, res, next) => {
  console.log('--- Entered getRecentActivitiesController ---');
  try {
    const activities = await getRecentActivitiesService(req.user);
    console.log('Recent Activites : =====> ', activities);

    return res.status(200).json({
      status: 'success',
      message: 'فعالیت‌های اخیر با موفقیت دریافت شد.',
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsersAdminController = async (req, res, next) => {
  console.log('--- Entered getAllUsersAdminController ---');
  try {
    const { page, limit, sortBy, sortOrder, role, search } = req.query;
    const user = req.user; // کاربر ادمین از protect
    console.log(
      '🔍 ~  ~ server/src/controllers/adminController.js:46 ~ user:',
      user
    );

    const result = await getAllUsersAdminService(user, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy: sortBy,
      sortOrder: sortOrder,
      roleFilter: role, // پاس دادن فیلتر نقش
      search: search,
    });

    res.status(200).json({
      status: 'success',
      message: 'لیست کاربران با موفقیت دریافت شد.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
/**
 * کنترلر برای مسدود کردن کاربر
 */
export const blockUserAdminController = async (req, res, next) => {
  console.log(
    `--- Entered blockUserAdminController for ID: ${req.params.id} ---`
  );
  try {
    const userIdToBlock = req.params.id;
    const { reason } = req.body; // دریافت دلیل از بدنه درخواست (اختیاری)
    const requestingUser = req.user;

    if (!userIdToBlock) {
      /* ... خطای 400 ... */
    }

    const blockedUser = await blockUserService(
      userIdToBlock,
      reason,
      requestingUser
    );

    res.status(200).json({
      status: 'success',
      message: 'کاربر با موفقیت مسدود شد.',
      data: { user: blockedUser },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * کنترلر برای رفع مسدودیت کاربر
 */
export const unblockUserAdminController = async (req, res, next) => {
  console.log(
    `--- Entered unblockUserAdminController for ID: ${req.params.id} ---`
  );
  try {
    const userIdToUnblock = req.params.id;
    const requestingUser = req.user;

    if (!userIdToUnblock) {
      /* ... خطای 400 ... */
    }

    const unblockedUser = await unblockUserService(
      userIdToUnblock,
      requestingUser
    );

    res.status(200).json({
      status: 'success',
      message: 'کاربر با موفقیت رفع مسدودیت شد.',
      data: { user: unblockedUser },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserAdminController = async (req, res, next) => {
  console.log(
    `--- Entered deleteUserAdminController for ID: ${req.params.id} ---`
  );
  try {
    const userIdToDelete = req.params.id;
    const requestingUser = req.user;

    if (!userIdToDelete) {
      /* ... خطای 400 */
    }

    await deleteUserAdminService(userIdToDelete, requestingUser);

    // ارسال پاسخ 204 No Content برای DELETE موفق
    console.log(
      `Successfully processed delete request for user ${userIdToDelete}. Sending 204.`
    );
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// ...

/**
 * کنترلر برای تغییر نقش کاربر توسط سوپرادمین
 */
export const changeUserRoleAdminController = async (req, res, next) => {
  console.log(
    `--- Entered changeUserRoleAdminController for ID: ${req.params.id} ---`
  );
  try {
    const userIdToChange = req.params.id;
    const { role: newRole } = req.body; // نقش جدید از بدنه درخواست
    const requestingUser = req.user;

    if (!userIdToChange || !newRole) {
      /* ... خطای 400 ... */
    }

    const updatedUser = await changeUserRoleAdminService(
      userIdToChange,
      newRole,
      requestingUser
    );

    res.status(200).json({
      status: 'success',
      message: 'نقش کاربر با موفقیت تغییر یافت.',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};
