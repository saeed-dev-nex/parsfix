// server/src/utils/AppError.js (مثال)
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // مهم
    Error.captureStackTrace(this, this.constructor);
  }
}
export default AppError;

// سپس در authService.js:
// import AppError from '../utils/AppError.js';
