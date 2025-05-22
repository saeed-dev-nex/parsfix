import prisma from '../../config/db.js';
import { Role, MovieStatus } from '@prisma/client';
/**
 * Service for get list of users and user details.
 * @module getAllUsersAdminService
 * @param {Object} user - User object
 * @param {object} options - Options object (page, limit, sortBy, sortOrder, roleFilter)
 * @return {Promise<object>} - Promise that resolves to an array of user objects
 */

export const getAllUsersAdminService = async (
  user,
  {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    roleFilter = null,
    search = null,
  }
) => {
  console.log(
    `Fetching users list for admin ${user.id} (Role: ${user.role}) with options:`,
    { page, limit, sortBy, sortOrder, roleFilter }
  );
  try {
    const skip = (page - 1) * limit;
    const take = parseInt(limit, 10);
    if (isNaN(take) || take <= 0) throw new Error('مقدار limit نامعتبر است.');

    const allowedSortFields = [
      'email',
      'name',
      'role',
      'createdAt',
      'isActivated',
      'isBlocked',
    ];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : 'createdAt';
    const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    let whereCondition = {};

    // فیلتر نقش (فقط برای سوپرادمین)
    if (
      user.role === Role.SUPER_ADMIN &&
      roleFilter &&
      Object.values(Role).includes(roleFilter)
    ) {
      whereCondition.role = roleFilter;
    }

    // محدودیت دسترسی بر اساس نقش
    if (user.role === Role.ADMIN) {
      whereCondition.role = Role.USER; // ادمین فقط کاربران عادی
      console.log('Admin view: Filtering for ROLE=USER only.');
    } else if (user.role === Role.SUPER_ADMIN) {
      whereCondition.id = { not: user.id }; // سوپرادمین همه بجز خودش
      console.log('Super Admin view: Fetching relevant roles except self.');
    } else {
      throw new Error('دسترسی غیر مجاز.'); // 403
    }
    // --- اضافه کردن فیلتر جستجو ---
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerm = search.trim();
      console.log(`Applying search filter: ${searchTerm}`);
      whereCondition.OR = [
        {
          name: {
            contains:
              searchTerm /*, mode: 'insensitive' در صورت نیاز و پشتیبانی دیتابیس */,
          },
        },
        { email: { contains: searchTerm /*, mode: 'insensitive' */ } },
      ];
    }
    // -----------------------------

    // واکشی کاربران
    console.log('Executing findMany with where:', whereCondition); // <-- لاگ شرط نهایی
    const users = await prisma.user.findMany({
      // <--- خط ۷۱-۷۲: استفاده از prisma
      where: whereCondition,
      skip: skip,
      take: take,
      orderBy: { [safeSortBy]: safeSortOrder },
      select: {
        // فیلدهای لازم
        id: true,
        email: true,
        name: true,
        role: true,
        isActivated: true,
        isBlocked: true,
        blockReason: true,
        profilePictureUrl: true,
        createdAt: true,
        dateOfBirth: true,
        gender: true,
        _count: {
          select: { comments: true, ratings: true, addedMovies: true },
        },
      },
    });

    // تعداد کل کاربران با شرط
    console.log('Executing count with where:', whereCondition); // <-- لاگ شرط نهایی
    const totalUsers = await prisma.user.count({ where: whereCondition }); // <--- استفاده از prisma
    const totalPages = Math.ceil(totalUsers / take);

    console.log(
      `Found ${users.length} users (Total matching criteria: ${totalUsers})`
    );
    return {
      users,
      totalUsers,
      totalPages,
      currentPage: parseInt(page, 10),
      limit: take,
    };
  } catch (error) {
    // --- لاگ کردن خطای اصلی Prisma ---
    console.error('Error fetching admin user list:', error);
    // --------------------------------
    throw error; // ارسال به errorHandler
  }
};

/**
 * Service for blocking a user.
 * @param {string} userIdToBlock
 * @param {string} blockReason
 * @param {object} requestingUser
 * @returns {Promise<object>}
 */
export const blockUserService = async (
  userIdToBlock,
  blockReason,
  requestingUser
) => {
  console.log(
    `Admin ${requestingUser.id} attempting to block user ${userIdToBlock}. Reason: ${blockReason}`
  );

  // Find the user to be blocked
  const userToBlock = await prisma.user.findUnique({
    where: { id: userIdToBlock },
    select: { id: true, role: true, isBlocked: true },
  });

  if (!userToBlock) {
    throw new Error('کاربر مورد نظر برای مسدود کردن یافت نشد.'); // 404
  }

  // جلوگیری از عملیات روی خود ادمین
  if (userToBlock.id === requestingUser.id) {
    throw new Error('شما نمی‌توانید حساب کاربری خودتان را مسدود کنید.'); // 400
  }

  // بررسی دسترسی
  let canBlock = false;
  if (requestingUser.role === Role.SUPER_ADMIN) {
    // سوپر ادمین می‌تواند کاربران عادی و ادمین‌های دیگر را مسدود کند
    canBlock =
      userToBlock.role === Role.USER || userToBlock.role === Role.ADMIN;
  } else if (requestingUser.role === Role.ADMIN) {
    // ادمین فقط می‌تواند کاربران عادی را مسدود کند
    canBlock = userToBlock.role === Role.USER;
  }

  if (!canBlock) {
    throw new Error(
      `شما اجازه مسدود کردن کاربری با نقش ${userToBlock.role} را ندارید.`
    ); // 403
  }

  // اگر کاربر از قبل مسدود است
  if (userToBlock.isBlocked) {
    console.log(`User ${userIdToBlock} is already blocked.`);
    // می‌توانید خطا برنگردانید و فقط کاربر آپدیت شده را برگردانید یا پیام بدهید
    // return userToBlock; // یا return prisma.user.findUnique... با select کامل
    // یا یک خطای ملایم‌تر:
    throw new Error('این کاربر قبلاً مسدود شده است.'); // 400
  }

  // آپدیت وضعیت مسدودیت و دلیل آن
  try {
    const blockedUser = await prisma.user.update({
      where: { id: userIdToBlock },
      data: {
        isBlocked: true,
        blockReason: blockReason || null, // اگر دلیلی نبود null ذخیره کن
      },
      select: {
        // فیلدهای لازم برای بازگشت
        id: true,
        email: true,
        name: true,
        role: true,
        isActivated: true,
        isBlocked: true,
        blockReason: true,
        profilePictureUrl: true,
        createdAt: true,
        dateOfBirth: true,
        gender: true,
        _count: {
          select: { comments: true, ratings: true, addedMovies: true },
        },
      },
    });
    console.log(`User ${userIdToBlock} blocked successfully.`);
    return blockedUser;
  } catch (error) {
    console.error(`Error blocking user ${userIdToBlock}:`, error);
    throw new Error('خطا در مسدود کردن کاربر در دیتابیس.'); // 500
  }
};

/**
 * سرویس برای رفع مسدودیت یک کاربر
 * @param {string} userIdToUnblock - ID کاربری که باید رفع مسدودیت شود
 * @param {object} requestingUser - کاربر ادمین درخواست دهنده
 * @returns {Promise<object>} - کاربر رفع مسدودیت شده
 */
export const unblockUserService = async (userIdToUnblock, requestingUser) => {
  console.log(
    `Admin ${requestingUser.id} attempting to unblock user ${userIdToUnblock}.`
  );

  // یافتن کاربر
  const userToUnblock = await prisma.user.findUnique({
    where: { id: userIdToUnblock },
    select: { id: true, role: true, isBlocked: true },
  });

  if (!userToUnblock) {
    throw new Error('کاربر مورد نظر یافت نشد.'); /* 404 */
  }

  // جلوگیری از عملیات روی خود
  if (userToUnblock.id === requestingUser.id) {
    throw new Error('عملیات روی خود کاربر مجاز نیست.'); /* 400 */
  }

  // بررسی دسترسی (مشابه مسدود کردن)
  let canUnblock = false;
  if (requestingUser.role === Role.SUPER_ADMIN) {
    canUnblock =
      userToUnblock.role === Role.USER || userToUnblock.role === Role.ADMIN;
  } else if (requestingUser.role === Role.ADMIN) {
    canUnblock = userToUnblock.role === Role.USER;
  }
  if (!canUnblock) {
    throw new Error(
      `شما اجازه رفع مسدودیت کاربری با نقش ${userToUnblock.role} را ندارید.`
    ); /* 403 */
  }

  // اگر کاربر مسدود نیست
  if (!userToUnblock.isBlocked) {
    console.log(`User ${userIdToUnblock} is not blocked.`);
    throw new Error('این کاربر مسدود نیست.'); // 400
  }

  // آپدیت برای رفع مسدودیت
  try {
    const unblockedUser = await prisma.user.update({
      where: { id: userIdToUnblock },
      data: {
        isBlocked: false,
        blockReason: null, // پاک کردن دلیل مسدودیت
      },
      select: {
        /* ... فیلدهای مشابه select در blockUserService ... */ id: true,
        email: true,
        name: true,
        role: true,
        isActivated: true,
        isBlocked: true,
        blockReason: true,
        profilePictureUrl: true,
        createdAt: true,
        dateOfBirth: true,
        gender: true,
        _count: {
          select: { comments: true, ratings: true, addedMovies: true },
        },
      },
    });
    console.log(`User ${userIdToUnblock} unblocked successfully.`);
    return unblockedUser;
  } catch (error) {
    console.error(`Error unblocking user ${userIdToUnblock}:`, error);
    throw new Error('خطا در رفع مسدودیت کاربر در دیتابیس.'); // 500
  }
};

/**
 * سرویس برای حذف یک کاربر توسط ادمین/سوپرادمین
 * @param {string} userIdToDelete - ID کاربری که باید حذف شود
 * @param {object} requestingUser - کاربر ادمینی که درخواست را داده
 * @returns {Promise<boolean>} - true در صورت موفقیت
 * @throws {Error | AppError} - در صورت خطا یا عدم دسترسی
 */
export const deleteUserAdminService = async (
  userIdToDelete,
  requestingUser
) => {
  console.log(
    `Admin ${requestingUser.id} attempting to delete user ${userIdToDelete}.`
  );

  // یافتن کاربری که قرار است حذف شود
  const userToDelete = await prisma.user.findUnique({
    where: { id: userIdToDelete },
    select: { id: true, role: true }, // فقط نقش برای بررسی دسترسی لازم است
  });

  if (!userToDelete) {
    throw new Error('کاربر مورد نظر برای حذف یافت نشد.'); // 404
  }

  // جلوگیری از حذف خود
  if (userToDelete.id === requestingUser.id) {
    throw new Error('شما نمی‌توانید حساب کاربری خودتان را حذف کنید.'); // 400
  }

  // بررسی دسترسی
  let canDelete = false;
  if (requestingUser.role === Role.SUPER_ADMIN) {
    // سوپر ادمین می‌تواند کاربران عادی و ادمین‌های دیگر را حذف کند
    canDelete =
      userToDelete.role === Role.USER || userToDelete.role === Role.ADMIN;
  } else if (requestingUser.role === Role.ADMIN) {
    // ادمین فقط می‌تواند کاربران عادی را حذف کند
    canDelete = userToDelete.role === Role.USER;
  }

  if (!canDelete) {
    throw new Error(
      `شما اجازه حذف کاربری با نقش ${userToDelete.role} را ندارید.`
    ); // 403
  }

  // انجام عملیات حذف
  // توجه: روابطی که onDelete: Cascade دارند (مثل کامنت، امتیاز) هم حذف می‌شوند
  try {
    await prisma.user.delete({
      where: { id: userIdToDelete },
    });
    console.log(
      `User ${userIdToDelete} deleted successfully by admin ${requestingUser.id}.`
    );
    return true; // موفقیت
  } catch (error) {
    console.error(`Error deleting user ${userIdToDelete}:`, error);
    // throw new AppError('خطا در حذف کاربر از دیتابیس.', 500);
    throw error;
  }
};
/**
 * کنترلر برای حذف کاربر توسط ادمین
 */

/**
 * سرویس برای تغییر نقش کاربر (فقط توسط سوپرادمین)
 * @param {string} userIdToChange - ID کاربر هدف
 * @param {Role} newRole - نقش جدید (باید USER یا ADMIN باشد)
 * @param {object} requestingUser - کاربر سوپرادمین درخواست دهنده
 * @returns {Promise<object>} - کاربر با نقش آپدیت شده
 */
export const changeUserRoleAdminService = async (
  userIdToChange,
  newRole,
  requestingUser
) => {
  console.log(
    `SUPER_ADMIN ${requestingUser.id} attempting to change role of user ${userIdToChange} to ${newRole}.`
  );

  // اطمینان از اینکه نقش جدید معتبر است (برای جلوگیری از تبدیل به سوپرادمین)
  if (newRole !== Role.USER && newRole !== Role.ADMIN) {
    throw new Error('نقش جدید انتخاب شده نامعتبر است.'); // 400
  }

  // یافتن کاربر هدف
  const userToChange = await prisma.user.findUnique({
    where: { id: userIdToChange },
    select: { id: true, role: true },
  });
  if (!userToChange) {
    throw new Error('کاربر مورد نظر یافت نشد.'); /* 404 */
  }

  // سوپرادمین نمی‌تواند نقش خودش را تغییر دهد
  if (userToChange.id === requestingUser.id) {
    throw new Error('شما نمی‌توانید نقش خودتان را تغییر دهید.'); // 400
  }
  // سوپرادمین نمی‌تواند نقش سوپرادمین دیگری را تغییر دهد
  if (userToChange.role === Role.SUPER_ADMIN) {
    throw new Error('شما نمی‌توانید نقش یک سوپرادمین دیگر را تغییر دهید.'); // 403
  }
  // اگر نقش فعلی با نقش جدید یکی بود
  if (userToChange.role === newRole) {
    throw new Error(`کاربر در حال حاضر نقش ${newRole} را دارد.`); // 400
  }

  // آپدیت نقش
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userIdToChange },
      data: { role: newRole },
      select: {
        /* ... فیلدهای کامل و امن ... */ id: true,
        email: true,
        name: true,
        role: true,
        isActivated: true,
        isBlocked: true,
        blockReason: true,
        profilePictureUrl: true,
        createdAt: true,
        dateOfBirth: true,
        gender: true,
      },
    });
    console.log(
      `Role of user ${userIdToChange} changed to ${newRole} by ${requestingUser.id}.`
    );
    return updatedUser;
  } catch (error) {
    console.error(`Error changing role for user ${userIdToChange}:`, error);
    throw new Error('خطا در تغییر نقش کاربر.'); // 500
  }
};
