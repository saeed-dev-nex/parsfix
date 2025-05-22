import { z } from "zod";
const genderEnum = z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]);
export const updateProfileSchema = z.object({
  name: z
    .string({ required_error: "نام الزامی است" })
    .min(1, { message: "نام نمی‌تواند خالی باشد" })
    .max(100, { message: "نام نمی‌تواند بیشتر از 100 کاراکتر باشد" }),
  // Todo: add Profile Picture and other filed
  dateOfBirth: z.coerce.date().optional().nullable(),
  gender: genderEnum.optional().nullable(),
});
