import { z } from 'zod';

// Schema برای آپدیت اطلاعات پایه قسمت (همه اختیاری)
export const updateEpisodeSchema = z.object({
  title: z.string().max(255).optional().nullable(),
  overview: z.string().optional().nullable(),
  airDate: z.coerce.date().optional().nullable(), // تبدیل رشته به Date
  runtime: z.number().int().positive().optional().nullable(),
  // episodeNumber و seasonNumber معمولا توسط TMDB تعیین می‌شوند و نباید دستی آپدیت شوند
  // stillPath جداگانه آپدیت می‌شود
});
