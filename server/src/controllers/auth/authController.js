import {
  activateUserAccount,
  loginUser,
  resendActivationCodeService,
  signupUser,
  verifyGoogleTokenAndSignIn,
  checkEmailExistsService,
} from '../../services/auth/authService.js';

function calculateMaxAge(expiresIn) {
  // 1. if no ExpiresDate Return 1 Day
  if (!expiresIn) return 24 * 60 * 60 * 1000;
  // Get the last character (unit) from expiresIn string and convert to lowercase
  const unit = expiresIn.slice(-1).toLowerCase();
  // Extract the numeric value by removing the last character and parse to integer
  const value = parseInt(expiresIn.slice(0, -1), 10);
  if (unit === 'd') {
    return value * 24 * 60 * 60 * 1000; //Day In ms
  }
  if (unit === 'h') {
    return value * 60 * 60 * 1000; //Hour In ms
  }
  return 7 * 24 * 60 * 60 * 1000; //Default Expire time  = 7 Day
}

const cookieOptions = {
  httpOnly: true, // Prevents JavaScript access to the cookie
  secure: process.env.NODE_ENV === 'production', //for https
  sameSite: 'strict', // protect from CSRF
  path: '/', //for all path
  maxAge: calculateMaxAge(process.env.JWT_EXPIRES_IN), //max age of cookie
};

/* ************************************************** */
/*              User Register Controller              */
/* ************************************************** */
export async function signupController(req, res, next) {
  const { user, token } = await signupUser(req.body);
  res.cookie('authToken', token, cookieOptions);

  res.status(201).json({
    status: 'success',
    message:
      'ثبت نام با موفقیت انجام شد. لطفا ایمیل خود را برای فعال سازی بررسی کنید.', // پیام برای فعال سازی
    data: { user },
  });
  try {
  } catch (error) {
    next(error);
  }
}
/****************************************************/

/****************************************************/
/*               User Login Controller              */
/****************************************************/
export async function loginController(req, res, next) {
  try {
    // 1. get user data from req.body and verification
    const { user, token } = await loginUser(req.body);
    // 2. set Response Cookie
    res.cookie('authToken', token, cookieOptions);
    3;
    res.status(200).json({
      status: 'success',
      message: 'ورود با موفقیت انجام شد',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}
/****************************************************/

/****************************************************/
/*                Logout User Controller            */
/****************************************************/

export async function logoutController(req, res, next) {
  try {
    // Clear cookie with the same options (except maxAge/expires)
    res.clearCookie('authToken', {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
    });

    res
      .status(200)
      .json({ status: 'success', message: 'خروج با موفقیت انجام شد.' });
  } catch (error) {
    next(error);
  }
}
/****************************************************/

/****************************************************/
/* Activate User Account Controller        */
/****************************************************/
export async function activateAccountController(req, res, next) {
  try {
    // Assume authentication middleware (which we will build later) has placed the user in req.user
    const { email, code } = req.body;
    console.log('active ======> ', email, code);

    await activateUserAccount({ email, code });
    res.status(200).json({
      status: 'success',
      message: 'حساب کاربری شما با موفقیت فعال شد.',
    });
  } catch (error) {
    next(error);
  }
}

/****************************************************/
/* get User Data from Cookie Controller       */
/****************************************************/
export async function getMeController(req, res, next) {
  try {
    // req.user is set by protect middleware
    const user = req.user;

    // This extra check is usually not necessary because protect Middleware has already done it,
    // but it can remain for extra safety.
    if (!user) {
      const error = new Error('خطای غیرمنتظره: اطلاعات کاربر یافت نشد.');
      error.statusCode = 401; // or another appropriate status code
      error.status = 'error';
      return next(error);
    }
    console.log(user);

    // Return only necessary and secure user information
    // No need to select again since protect middleware already did it
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActivated: user.isActivated,
          profilePictureUrl: user.profilePictureUrl,
          createdAt: user.createdAt,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          // Avoid sending sensitive fields like isBlocked, blockReason in
          // the response unless necessary
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
/****************************************************/
/*          Resend Activation Controller            */
/****************************************************/
async function resendActivationController(req, res, next) {
  try {
    const { email } = req.body;
    const message = await resendActivationCodeService(email);
    res.status(200).json({
      status: 'success',
      message,
    });
  } catch (error) {
    next(error);
  }
}

/****************************************************/
/*       Google Sign-In Controller                  */
/****************************************************/
export async function googleSignInController(req, res, next) {
  try {
    const { idToken } = req.body; // دریافت توکن از کلاینت

    if (!idToken) {
      // throw new BadRequestError('توکن گوگل ارائه نشده است.');
      const error = new Error('توکن گوگل ارائه نشده است.');
      error.statusCode = 400;
      return next(error);
    }

    // فراخوانی سرویس برای اعتبارسنجی توکن و ورود/ثبت‌نام کاربر
    const { user, token } = await verifyGoogleTokenAndSignIn(idToken);

    // تنظیم کوکی http-only برای JWT
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Lax ممکن است برای ریدایرکت‌ها بهتر باشد
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 روز
      path: '/',
    };
    res.cookie('authToken', token, cookieOptions);

    // آماده‌سازی پاسخ - حذف فیلدهای حساس
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActivated: user.isActivated,
      profilePictureUrl: user.profilePictureUrl,
      createdAt: user.createdAt,
    };

    // ارسال پاسخ موفقیت آمیز
    res.status(200).json({
      status: 'success',
      message: 'ورود با گوگل موفقیت آمیز بود.',
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    // ارسال خطا به error handler
    next(error);
  }
}

/**
 * کنترلر برای بررسی وجود ایمیل
 */
export async function checkEmailController(req, res, next) {
  console.log('--- Entered checkEmailController ---');
  try {
    const { email } = req.body; // ایمیل از بدنه درخواست خوانده می‌شود
    if (!email) {
      // در ولیدیشن هم چک می‌شود، اما اینجا هم یک بررسی اولیه خوب است
      return res
        .status(400)
        .json({ status: 'fail', message: 'ایمیل ارائه نشده است.' });
    }

    const result = await checkEmailExistsService(email);

    res.status(200).json({
      status: 'success',
      message: 'وضعیت ایمیل بررسی شد.',
      data: result, // شامل exists, isActivated, isBlocked, email
    });
  } catch (error) {
    next(error); // ارسال خطا به errorHandler
  }
}

