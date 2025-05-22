import z from 'zod';
import { Role } from '@prisma/client';
export const changeRoleSchema = z.object({
  role: z
    .nativeEnum(Role, {
      errorMap: (issue, ctx) => ({ message: 'نقش انتخاب شده نامعتبر است.' }),
    })
    // فقط اجازه تغییر به USER یا ADMIN را می‌دهیم
    .refine((role) => role === Role.USER || role === Role.ADMIN, {
      message: 'نقش کاربر فقط می‌تواند به USER یا ADMIN تغییر یابد.',
    }),
});
