// server/src/middlewares/errorMiddleware.js
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.error('ERROR caught by errorHandler:', err);
  console.log('Does err have code?', err.code);

  // اولویت با ارسال جزئیات در حالت توسعه
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      code: err.code,
      stack: err.stack,
    });
  }

  // بررسی کدهای خطای عملیاتی شناخته شده (قبل از isOperational یا به جای آن)
  const knownOperationalCodes = [
    'ACTIVATION_PENDING',
    'ACTIVATION_RESENT' /*, کدهای دیگر...*/,
  ];
  if (knownOperationalCodes.includes(err.code)) {
    // برای این کدها، کد وضعیت مناسب (مثلاً 401 یا 403) و جزئیات را بفرست
    return res.status(err.statusCode || 401).json({
      // کد وضعیت را 401 یا 403 بگذارید
      status: 'fail', // یا status مناسب دیگر
      message: err.message,
      code: err.code,
    });
  }

  // اگر از کلاس خطای سفارشی استفاده می‌کنید، این شرط را نگه دارید
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      code: err.code,
    });
  }

  // در غیر این صورت، خطای برنامه‌نویسی یا ناشناخته است
  console.error('PROGRAMMING OR UNKNOWN ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'مشکلی در سرور رخ داده است!',
  });
};
export default errorHandler;
