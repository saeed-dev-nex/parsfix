import { z } from 'zod';

// Enum برای وضعیت فیلم (مطمئن شوید در schema.prisma هم تعریف شده)
const movieStatusEnum = z.enum(['PENDING', 'PUBLISHED', 'ARCHIVED'], {
  errorMap: (issue, ctx) => ({
    message: 'وضعیت نامعتبر است. مقادیر مجاز: PENDING, PUBLISHED, ARCHIVED',
  }),
});

// Schema برای داده‌های ارسالی هنگام ایجاد فیلم از طریق TMDB ID
export const createMovieSchema = z.object({
  tmdbId: z
    .number({
      // انتظار داریم کلاینت عدد بفرستد
      required_error: 'شناسه TMDB الزامی است',
      invalid_type_error: 'شناسه TMDB باید عدد باشد',
    })
    .int({ message: 'شناسه TMDB باید عدد صحیح باشد' })
    .positive({ message: 'شناسه TMDB باید مثبت باشد' }),

  status: movieStatusEnum // وضعیت فیلم باید یکی از مقادیر enum باشد
    .optional() // ارسال وضعیت اختیاری است؟ یا پیش‌فرض PENDING بگذاریم؟
    .default('PENDING'), // اگر کلاینت نفرستاد، پیش‌فرض PENDING باشد

  // می‌توانید فیلدهای override اختیاری را هم اینجا اضافه کنید
  // title: z.string().optional(),
  // description: z.string().optional(),
});
export const updateMovieSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  originalTitle: z.string().max(255).optional().nullable(),
  tagline: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  releaseDate: z.coerce.date().optional().nullable(),
  runtime: z.number().int().positive().optional().nullable(),
  status: movieStatusEnum.optional(), // وضعیت اختیاری
  originalLanguage: z.string().max(10).optional().nullable(),
  popularity: z.number().optional().nullable(),
  imdbId: z.string().max(20).optional().nullable(),
  adult: z.boolean().optional(),
  posterPath: z
    .string()
    .url({ message: 'آدرس پوستر نامعتبر است' })
    .optional()
    .nullable(), // ولیدیشن URL
  backdropPath: z
    .string()
    .url({ message: 'آدرس بک‌دراپ نامعتبر است' })
    .optional()
    .nullable(),
  trailerUrl: z
    .string()
    .url({ message: 'آدرس تریلر نامعتبر است' })
    .optional()
    .nullable(),
  imdbRating: z.number().min(0).max(10).optional().nullable(),
  rottenTomatoesScore: z.number().int().min(0).max(100).optional().nullable(),
  genreIds: z
    .array(z.string().cuid({ message: 'فرمت شناسه ژانر نامعتبر است' }))
    .optional()
    .nullable(),
});
