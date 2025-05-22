import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/jwtHelper.js";
import prisma from "../config/db.js";
import AppError from "../utils/AppError.js";

export const protect = async (req, res, next) => {
  console.log("--- Entering protect middleware ---");
  console.log("Cookies received by protect middleware:", req.cookies);
  console.log(
    "JWT_SECRET used for verification:",
    process.env.JWT_SECRET ? "Exists" : "MISSING!"
  );
  let token;
  try {
    // 1. Reade token from http-only cookie
    if (req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken;
      console.log("Token found in cookie:", token ? "Yes" : "No");
    }
    // 2. if no Exists Token
    if (!token) {
      return next(
        new AppError("401", "کاربر احراز هویت نشده است لطفا وارد شوید.")
      );
    }
    console.log("Attempting to verify token...");
    // 3. Verify Token
    const decodedPayload = verifyToken(token);
    // 4. If token is invalid, return 401 Unauthorized
    if (!decodedPayload || !decodedPayload.userId) {
      console.log(
        "Decoded payload invalid or missing userId, creating 401 error..."
      );
      // return next(new Error(401,'Invalid token'))
      return next(AppError("401", "توکن نامعتبر یا منقضی شده است."));
    }
    console.log(
      `Token verified. User ID: ${decodedPayload.userId}. Finding user...`
    );
    // 5. find user by id
    const currentUser = await prisma.user.findUnique({
      where: {
        id: decodedPayload.userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profilePictureUrl: true,
        isActivated: true,
        isBlocked: true,
        createdAt: true,
        dateOfBirth: true,
        gender: true,
      },
    });
    console.log(
      "User found in DB:",
      currentUser ? currentUser.id : "Not Found"
    );
    // 6. if user not fount by this ID Like Remove USER return 401 Unauthorized
    if (!currentUser) {
      // return next(new AppError('کاربری که این توکن به آن تعلق دارد دیگر وجود ندارد.', 401));
      // پاک کردن کوکی نامعتبر در سمت کلاینت (اختیاری ولی خوب)
      res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      return next(
        AppError("401", "کاربری که این توکن به آن تعلق دارد دیگر وجود ندارد.")
      );
    }
    // 7. if user not found, return 403 Unauthorized
    if (!currentUser.isActivated) {
      return next(AppError(403, "Uحساب کاربری شما فعال نشده است."));
    }
    // 8. if user is blocked, return 403 Unauthorized
    if (currentUser.isBlocked) {
      const blockMessage = currentUser.blockReason
        ? `حساب کاربری بلاک شده است. دلیل: ${currentUser.blockReason}`
        : `حساب کاربری بلاک شده است.`;
      return next(AppError(403, blockMessage));
    }

    // 9. Attach user to request object
    req.user = currentUser;
    // 10. Proceed to next middleware or route handler
    console.log("User attached to req.user. Proceeding...");
    next();
  } catch (error) {
    console.error(
      "--- Error caught in protect middleware catch block: ---",
      error.name,
      error.message
    );

    if (error instanceof jwt.JsonWebTokenError) {
      return next(AppError("401", "توکن ارائه شده معتبر نیست."));
    }
    if (error instanceof jwt.TokenExpiredError) {
      console.log("Handling TokenExpiredError...");

      return next(
        AppError("401", "نشست شما منقضی شده است. لطفاً دوباره وارد شوید.")
      );
    }
    // ارسال به error handler عمومی برای خطاهای دیگر
    // next(new AppError('خطای داخلی در فرآیند احراز هویت.', 500));
    console.log("Handling other error in catch block...");
    next(error); // ارسال خطای اصلی به error handler
  }
};

// تابع restrictTo بدون تغییر (اگر نیاز دارید)
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(AppError("403", "شما اجازه دسترسی به این عملیات را ندارید."));
    }

    next();
  };
};
