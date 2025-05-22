import { z } from "zod";
export const signupSchema = z.object({
  email: z
    .string({ required_error: "ایمیل الزامی است" })
    .email({ message: "فرمت ایمیل معتبر نیست" }),
  password: z
    .string({ required_error: "رمز عبور الزامی است" })
    .min(8, { message: "رمز عبور باید حداقل 8 کاراکتر باشد" }),
  name: z.string().min(3, { message: "نام باید حداقل 3 کاراکتر باشد" }),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "ایمیل الزامی است" })
    .email({ message: "فرمت ایمیل معتبر نیست" }),
  password: z
    .string({ required_error: "رمز عبور الزامی است" })
    .min(8, { message: "رمز عبور باید حداقل 8 کاراکتر باشد" }),
});

export const activationSchema = z.object({
  email: z
    .string({ required_error: "ایمیل الزامی است" })
    .email({ message: "فرمت ایمیل معتبر نیست" }),
  code: z
    .string()
    .min(6, { message: "کد فعالسازی باید 6 کاراکتر باشد" })
    .regex(/^\d{6}$/, { message: "کد فعال‌سازی باید فقط شامل ارقام باشد" }),
});

export const resendActivationSchema = z.object({
  email: z
    .string({ required_error: "ایمیل الزامی است" })
    .email({ message: "فرمت ایمیل معتبر نیست" }),
});

export const checkEmailSchema = z.object({
  email: z
    .string({ required_error: 'ایمیل الزامی است' })
    .email({ message: 'فرمت ایمیل معتبر نیست' })
    .trim()
    .toLowerCase(),
});