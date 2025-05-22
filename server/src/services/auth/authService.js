import { PrismaClient, Role } from '@prisma/client';
import otpGenerator from 'otp-generator';
import { sendActivationEmail } from '../admin/emailService.js';
import crypto from 'crypto';
import { tokenSender } from '../../utils/tokenSender.js';
import { hashPassword, comparePassword } from '../../utils/passwordHelper.js';
import admin from '../../config/firebaseAdmin.js';
import prisma from '../../config/db.js';
import AppError from '../../utils/AppError.js';

const MAX_ACTIVATION_ATTEMPTS = 5;
// helper function for generate token

// ----------------------------------------------------------
/**
 * Authentication Service
 * 
 * This service handles user authentication operations including:
 * - User signup
 * - User login
 * - Token generation
 * 
 * The service integrates with:
 * - prisma ORM for database operations
 * - JWT for token management
 * - Password hashing utilities
 * 
 * @module authService
 -------------------------------------------------------*/

//  a helper private function for generate token and send it with email
async function _SendNewActivationCode(user) {
  try {
    //1. generate a activate code (otp)  password use OTP
    const activationCode = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    // 2. Define ExpireTime for otp
    const activationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    // 3. Update User in DataBase {activationToken , activationCodeExpires}
    await prisma.user.update({
      where: { id: user.id },
      data: {
        activationToken: activationCode,
        activationTokenExpires: activationCodeExpires,
      },
    });
    // 4. Send Email with Activation Code
    await sendActivationEmail(user.email, activationCode);
    console.log(
      `کد فعاسازی به ایمیل :  ${user.email}: ارسال شده. و تا  ${activationCode} دقیقه معتبر است.`
    );
    return true;
  } catch (error) {
    console.error('Error sending activation code:', error);
    throw new Error('خطا در ارسال کد فعال‌سازی.');
  }
}
/*----------------------------------------------------------------*/
/*                    Signup  Account Service                     */
/*----------------------------------------------------------------*/
export async function signupUser({ email, password, name }) {
  // 1. Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email: email.trim().toLowerCase(),
    },
  });
  if (existingUser) {
    throw new Error('کاربری با این ایمیل قبلا ثبت نام کرده است');
    // TODO: handle error
  }
  // 2. Hash password
  const hashedPassword = await hashPassword(password);

  // 4. Create user in DataBase
  const newUser = await prisma.user.create({
    data: {
      email: email.trim().toLowerCase(),
      password: hashedPassword, // Store the hashed password
      name: name, // Store the name
      role: Role.USER, // Example: Set default role (adjust based on your schema)
      isActivated: false, // Example: Set default activation status
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActivated: true,
      isBlocked: true,
      createdAt: true,
      activationFailedAttempts: true,
    },
  });

  if (newUser) {
    _SendNewActivationCode(newUser);
  }

  // 6. create token for new User
  const token = tokenSender(newUser);
  // 7. return user and token
  return {
    user: newUser,
    token,
  };
}
/*----------------------------------------------------------------*/
/*                    LogIn User Account Service                  */
/*----------------------------------------------------------------*/

export async function loginUser({ email, password }) {
  // 1. Find User By ID
  const user = await prisma.user.findUnique({
    where: {
      email: email.trim().toLowerCase(),
    },
    select: {
      id: true,
      email: true,
      password: true, // برای مقایسه رمز لازم است
      name: true,
      role: true,
      isActivated: true,
      isBlocked: true,
      blockReason: true,
      activationToken: true, // برای بررسی کد
      activationTokenExpires: true, // برای بررسی انقضا
      profilePictureUrl: true,
      createdAt: true,
      dateOfBirth: true,
      gender: true,
    },
  });
  if (!user) {
    throw new Error('کاربری با این ایمیل یافت نشد');
  }

  // 2. Compare received password with stored hashed password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('ایمیل یا رمز ورود اشتباه است');
  }
  //   3. Check user Account is Active or not
  if (!user.isActivated) {
    const now = new Date();
    // 👉 check activated token is exist and expire time is valid
    if (
      (user.activationToken && user.activationTokenExpires,
      user.activationTokenExpires > now)
    ) {
      const pendingError = new Error(
        'حساب کاربری شما فعال نشده است. لطفاً کد فعال‌سازی ارسال شده به ایمیل خود را وارد کنید.'
      );
      pendingError.code = 'ACTIVATION_PENDING';
      throw pendingError;
    } else {
      const resentSuccess = await _SendNewActivationCode(user);
      if (resentSuccess) {
        const resentError = new Error(
          'حساب کاربری شما فعال نشده است. کد فعال‌سازی جدیدی به ایمیل شما ارسال شد. لطفاً آن را وارد کنید.'
        );
        resentError.code = 'ACTIVATION_RESENT';
        throw resentError;
      } else {
        throw new Error(
          'حساب کاربری شما هنوز فعال نشده است. لطفا ایمیل خود را بررسی کنید.'
        );
      }
    }
  }
  //   4. Check user Account is Blocked or not
  if (user.isBlocked) {
    const blockMessage = user.blockReason
      ? `حساب کاربری شما مسدود شده است. به دلیل: ${user.blockReason}`
      : `حساب کاربری شما مسدود شده است لطفا با ایمیل پشتیبانی تماس بگیرید.`;
    throw new Error(blockMessage);
  }
  //   5. send token

  const token = await tokenSender(user);

  //   6. return user and token
  const userResponse = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActivated: user.isActivated,
    isBlocked: user.isBlocked,
    profilePictureUrl: user.profilePictureUrl,
    createdAt: user.createdAt,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
  };
  return {
    user: userResponse,
    token,
  };
}

/*----------------------------------------------------------------*/
/*                    Active user Account Service                 */
/*----------------------------------------------------------------*/
/**
 * سرویس فعالسازی حساب کاربری با استفاده از کد فعالسازی
 * @param {object} data
 * @param {string} data.email
 * @param {string} data.code
 * @returns {promises<boolean>}
 * @throws {Error}
 */

export async function activateUserAccount({ email, code }) {
  console.log('active service =====> ', email, code);

  const lowerCaseEmail = email.trim().toLowerCase();
  // 1. find user by email
  const user = await prisma.user.findUnique({
    where: {
      email: lowerCaseEmail,
    },
    select: {
      id: true,
      isActivated: true,
      activationToken: true,
      activationTokenExpires: true,
      activationFailedAttempts: true,
    },
  });
  // 2. Check if user exist
  if (!user) {
    throw new Error('کاربری با این ایمیل یافت نشد');
  }
  // 3. check user is not Active
  if (user.isActivated) {
    throw new Error('حساب کاربری شما از قبل فعال می باشد');
  }
  const isCodeValid = user.activationToken === code;
  console.log(
    'کد فعال سازی برابر است با کد  وارد شده : -------->',
    isCodeValid
  );
  console.log('activation token : ', user.activationToken);

  // 4. check activationCode is valid & user input code is matched
  if (!user.activationToken || user.activationToken !== code) {
    throw new Error(
      'کد فعالسازی نامعتبر است. لطفا در ورود کد فعالسازی دقت کنید'
    );
  }
  // 5. check activation code is Expired
  const now = new Date();
  const isExpired =
    !user.activationTokenExpires || user.activationTokenExpires < now;
  if (isExpired) {
    throw new Error(
      'کد فعالسازی شما منقضی شده است لطافا برای دریافت کد جدید مجددا وارد شوید!'
    );
  }
  // const isCodeValid = user.activationToken === code;
  if (!isCodeValid) {
    const newAttemptCount = user.activationFailedAttempts + 1;
    if (newAttemptCount > MAX_ACTIVATION_ATTEMPTS) {
      try {
        await prisma.user.delete({ where: { id: user.id } });
        console.log(
          `User ${email} deleted due to too many failed activation attempts.`
        );
        const deleteError = new Error(
          'حساب کاربری به دلیل تلاش‌های ناموفق متعدد حذف شد. لطفاً دوباره ثبت نام کنید.'
        );
        deleteError.statusCode = 410;
        deleteError.status = 'error';
        throw deleteError;
      } catch (deleteDbError) {
        console.error(
          `Failed to delete user ${email} after failed attempts:`,
          deleteDbError
        );
        throw new Error('خطای داخلی سرور هنگام حذف حساب کاربری.');
      }
    } else {
      // افزایش شمارنده تلاش ناموفق
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { activationFailedAttempts: newAttemptCount },
        });
      } catch (updateError) {
        console.error(
          `Failed to update failed attempts for user ${email}:`,
          updateError
        );
        // حتی اگر آپدیت شمارنده خطا داد، خطای کد نامعتبر را برگردان
      }
      // پرتاب خطای کد نامعتبر
      throw new Error('کد فعال‌سازی نامعتبر است.');
    }
    // --- پایان منطق شمارش و حذف ---
  }

  // 6. If passed all conditions active account
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isActivated: true,
        activationToken: null,
        activationTokenExpires: null,
        activationFailedAttempts: 0,
      },
    });
    console.log(`User account activated successfully for email: ${email}`);
    return true;
  } catch (dbError) {
    console.error(
      '*** ORIGINAL prisma UPDATE ERROR in activateUserAccount: ***'
    );
    console.error(dbError);
    // console.error(
    //   `Database error during account activation for email ${email}`,
    //   dbError
    // );
    throw new Error('خطای پایگاه داده در فعالسازی حساب کاربری');
  }
}
/*----------------------------------------------------------------*/

/*----------------------------------------------------------------*/
/*                    verify Google Account Service               */
/*----------------------------------------------------------------*/
/**
 * service for sign in with google
 * @param {object} data
 * @param {string} idToken
 * @returns {promises<boolean>}
 * @throws {Error}
 */

export async function verifyGoogleTokenAndSignIn(idToken) {
  try {
    // 1. Verify the ID token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid: googleId, email, name, picture } = decodedToken;

    if (!email) {
      // throw new BadRequestError('اطلاعات ایمیل از گوگل دریافت نشد.');
      throw new Error('اطلاعات ایمیل از گوگل دریافت نشد.');
    }
    const lowerCaseEmail = email.toLowerCase();

    // 2. Check if user exists with this googleId
    let user = await prisma.user.findUnique({
      where: { googleId },
    });

    if (user) {
      // User found by googleId - Log them in (after checks)
      console.log(`User found by googleId: ${user.id}`);
      if (!user.isActivated) {
        // Theoretically shouldn't happen if created via Google, but good check
        // throw new ForbiddenError('حساب کاربری شما غیرفعال است.');
        throw new Error('حساب کاربری شما غیرفعال است.'); // یا کد وضعیت 403
      }
      if (user.isBlocked) {
        console.log(
          `Login attempt by blocked user ${user.id} (Google Sign-In)`
        );
        // throw new ForbiddenError(`حساب کاربری شما مسدود شده است. ${user.blockReason || ''}`);
        const blockMessage = `حساب کاربری شما مسدود شده است. ${
          user.blockReason ? `دلیل: ${user.blockReason}` : ''
        }`;
        throw new AppError(blockMessage.trim(), 403); // 403 Forbidden
      }
      // User is valid, generate JWT
      const token = await tokenSender(user);
      return { user, token };
    }

    // 3. If not found by googleId, check if user exists with this email
    user = await prisma.user.findUnique({
      where: { email: lowerCaseEmail },
    });

    if (user) {
      // User found by email - Link googleId (if not already linked to another googleId)
      console.log(`User found by email, linking googleId: ${user.id}`);
      if (user.googleId && user.googleId !== googleId) {
        // Conflict: Email associated with a different Google account
        // throw new ConflictError('این ایمیل قبلاً با حساب گوگل دیگری مرتبط شده است.');
        throw new Error('این ایمیل قبلاً با حساب گوگل دیگری مرتبط شده است.'); // یا کد وضعیت 409
      }
      // Link account and activate if necessary
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleId,
          // Optionally update name/picture from Google?
          // name: user.name || name, // Update name only if missing
          // profilePictureUrl: user.profilePictureUrl || picture,
          isActivated: true, // Ensure account is active
        },
      });

      if (updatedUser.isBlocked) {
        // Double check block status after potential update
        throw new Error(
          `حساب کاربری شما مسدود شده است. ${updatedUser.blockReason || ''}`
        );
      }

      const token = await tokenSender(updatedUser);
      return { user: updatedUser, token };
    }

    // 4. If no user found by googleId or email - Create a new user
    console.log(
      `No user found, creating new user for email: ${lowerCaseEmail}`
    );
    const newUser = await prisma.user.create({
      data: {
        googleId: googleId,
        email: lowerCaseEmail,
        name: name || '', // Use name from Google, provide default if missing
        profilePictureUrl: picture, // Use picture from Google
        isActivated: true, // Already verified by Google
        role: 'USER', // Default role
        password: crypto.randomBytes(32).toString('hex'),
        // No password needed for Google sign-in users initially
      },
    });

    const token = await tokenSender(newUser);
    return { user: newUser, token };
  } catch (error) {
    console.error('Error in verifyGoogleTokenAndSignIn:', error);
    if (
      error.code === 'auth/id-token-expired' ||
      error.code === 'auth/argument-error' ||
      error.code === 'auth/id-token-revoked'
    ) {
      // throw new UnauthorizedError('توکن گوگل نامعتبر یا منقضی شده است.');
      throw new Error('توکن گوگل نامعتبر یا منقضی شده است.'); // یا کد وضعیت 401
    }
    // Re-throw other errors (like potential prisma errors during create/update or custom errors)
    // throw new InternalServerError("خطا در پردازش ورود با گوگل.");
    throw error; // پرتاب مجدد خطا برای مدیریت در کنترلر/errorHandler
  }
}
/*----------------------------------------------------------------*/

/*----------------------------------------------------------------*/
/*                   Resend Activation Code Service               */
/*----------------------------------------------------------------*/

/**
 * service for send activation code
 * @param {object} data
 * @param {string} email
 * @returns {promises<boolean>}
 */
export async function resendActivationCodeService(email) {
  const lowerCaseEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: lowerCaseEmail },
  });
  if (!user) {
    throw new AppError('کاربری با این ایمیل یافت نشد', 401);
  }
  if (user.isActivated) {
    throw new AppError('حساب کاربری شما از قبل فعال شده است', 403);
  }
  _SendNewActivationCode(user);
  return 'کد فعالسازی جدید برای شما ارسال شد لطفا به ایمیل خود مراجعه کنید';
}
/*----------------------------------------------------------------*/

/**
 * Check if the given email exists in the database and return an object with the existence, activation, and block status.
 * @param {string} email - The email to check
 * @returns {object} - An object with the following properties:
 *                     exists {boolean} - Whether the email exists or not
 *                     isActivated {boolean | null} - Whether the email has been activated or not (null if not found)
 *                     isBlocked {boolean} - Whether the email has been blocked or not
 *                     email {string} - The normalized (lowercased) version of the input email
 */
export const checkEmailExistsService = async (email) => {
  console.log(`[AuthService] Checking if email exists: ${email}`);
  if (!email || typeof email !== 'string') {
    throw new AppError('ایمیل معتبری ارائه نشده است.', 400);
  }
  const lowercasedEmail = email.trim().toLowerCase();

  try {
    const user = await prisma.user.findUnique({
      where: { email: lowercasedEmail },
      select: { id: true, isActivated: true, isBlocked: true }, // فقط فیلدهای لازم
    });

    if (user) {
      console.log(
        `[AuthService] Email ${email} found. Activated: ${user.isActivated}, Blocked: ${user.isBlocked}`
      );
      return {
        exists: true,
        isActivated: user.isActivated, // برای تصمیم‌گیری بهتر در کلاینت
        isBlocked: user.isBlocked, // مهم برای جلوگیری از هدایت به لاگین اگر مسدود است
        email: lowercasedEmail, // برگرداندن ایمیل نرمال شده
      };
    } else {
      console.log(`[AuthService] Email ${email} not found.`);
      return {
        exists: false,
        isActivated: null,
        isBlocked: false,
        email: lowercasedEmail,
      };
    }
  } catch (error) {
    console.error('[AuthService] Error checking email existence:', error);
    throw new AppError('خطا در بررسی ایمیل در دیتابیس.', 500);
  }
};
