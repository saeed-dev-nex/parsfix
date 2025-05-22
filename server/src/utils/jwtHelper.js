import jwt from 'jsonwebtoken';
import 'dotenv/config'; // اطمینان از بارگذاری .env

/**
 * یک توکن JWT می سازد
 * @param {object} payload - داده هایی که می خواهیم در توکن قرار دهیم (معمولا userId, role)
 * @returns {string} - توکن امضا شده
 */
export function generateToken(payload) {
  // خواندن مستقیم از process.env در داخل تابع
  const currentSecret = process.env.JWT_SECRET;
  const currentExpiresIn = process.env.JWT_EXPIRES_IN || '30d'; // مقدار پیش‌فرض

  if (!currentSecret) {
    console.error(
      'FATAL ERROR inside generateToken: JWT_SECRET is not defined.'
    );
    throw new Error('JWT Secret not configured properly.');
  }

  try {
    // استفاده مستقیم از متغیر محیطی
    const token = jwt.sign(payload, currentSecret, {
      expiresIn: currentExpiresIn,
    });
    return token;
  } catch (error) {
    console.error('Error generating JWT:', error);
    throw new Error('Could not generate token');
  }
}

/**
 * یک توکن JWT را اعتبارسنجی می کند
 * @param {string} token - توکن برای اعتبارسنجی
 * @returns {object} - payload توکن decode شده
 * @throws {Error | jwt.JsonWebTokenError | jwt.TokenExpiredError} - در صورت نامعتبر بودن توکن یا نبود سکرت
 */
export function verifyToken(token) {
  // خواندن مستقیم از process.env در داخل تابع
  const currentSecret = process.env.JWT_SECRET;

  if (!currentSecret) {
    console.error('FATAL ERROR inside verifyToken: JWT_SECRET is not defined.');
    // پرتاب خطا به جای null برای مدیریت بهتر در protect
    throw new Error('JWT Secret not configured for verification.');
  }

  try {
    // استفاده مستقیم از متغیر محیطی
    const decoded = jwt.verify(token, currentSecret);
    return decoded; // برگرداندن payload
  } catch (error) {
    console.error(
      'JWT Verification Error caught in verifyToken:',
      error.message
    );
    // پرتاب مجدد خطا برای مدیریت در protect
    throw error;
  }
}
