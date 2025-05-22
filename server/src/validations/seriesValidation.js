import { z } from 'zod';
import { SeriesStatus } from '@prisma/client';

const seriesStatusEnum = z.nativeEnum(SeriesStatus, {
  errorMap: () => ({ message: 'وضعیت نامعتبر است.' }),
});


export const createSeriesSchema = z.object({
  tmdbId: z
    .number({
      // کلاینت باید عدد بفرستد
      required_error: 'شناسه TMDB الزامی است',
      invalid_type_error: 'شناسه TMDB باید عدد باشد',
    })
    .int({ message: 'شناسه TMDB باید عدد صحیح باشد' })
    .positive({ message: 'شناسه TMDB باید مثبت باشد' }),

  // وضعیت اختیاری است، پیش‌فرض آن در سرویس PENDING می‌شود
  status: z
    .nativeEnum(SeriesStatus, {
      errorMap: (issue, ctx) => ({ message: 'وضعیت انتخاب شده نامعتبر است.' }),
    })
    .optional(),

  // می‌توانید فیلدهای override اختیاری را هم اینجا اضافه کنید (اگر در کلاینت امکانش را گذاشتید)
  // title: z.string().optional(),
  // description: z.string().optional(),
});

export const updateSeriesSchema = z.object({
  // فیلدهای قابل ویرایش (همه اختیاری)
  title: z.string().min(1).max(255).optional(),
  originalTitle: z.string().max(255).optional().nullable(),
  tagline: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  firstAirDate: z.coerce.date().optional().nullable(),
  lastAirDate: z.coerce.date().optional().nullable(),
  status: seriesStatusEnum.optional(),
  tmdbStatus: z.string().max(50).optional().nullable(),
  type: z.string().max(50).optional().nullable(),
  originalLanguage: z.string().max(10).optional().nullable(),
  popularity: z.number().optional().nullable(),
  numberOfSeasons: z.number().int().positive().optional().nullable(),
  numberOfEpisodes: z.number().int().positive().optional().nullable(),
  homepage: z.string().url().optional().nullable(),
  adult: z.boolean().optional(),
  // posterPath, backdropPath نیاز به آپلود جدا دارند
  // imdbRating, rottenTomatoesScore نیاز به منبع جدا دارند
  // trailerUrl: z.string().url().optional().nullable(), // اگر لینک تریلر دستی قابل ویرایش است
  // genreIds: z.array(z.string().cuid()).optional().nullable(), // برای آینده
  // credits: ... // برای آینده
});