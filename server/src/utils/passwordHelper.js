import bcrypt from "bcrypt";

const saltRounds = 10; // تعداد دورهای هش کردن (عدد بالاتر = امن تر ولی کندتر)

/**
 * رمز عبور ساده را هش می کند
 * @param {string} plainPassword - رمز عبور ساده
 * @returns {Promise<string>} - هش رمز عبور
 */
export async function hashPassword(plainPassword) {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Could not hash password"); // یا مدیریت خطای بهتر
  }
}

/**
 * رمز عبور ساده را با هش ذخیره شده مقایسه می کند
 * @param {string} plainPassword - رمز عبور ساده وارد شده توسط کاربر
 * @param {string} hashedPassword - هش ذخیره شده در دیتابیس
 * @returns {Promise<boolean>} - true اگر رمزها مطابقت داشتند، false در غیر این صورت
 */
export async function comparePassword(plainPassword, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error("Error comparing password:", error);
    return false; // در صورت خطا، عدم تطابق را برگردان
  }
}
