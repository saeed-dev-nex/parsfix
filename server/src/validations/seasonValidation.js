import { z } from 'zod';

// Schema برای آپدیت اطلاعات پایه فصل (همه اختیاری)
export const updateSeasonSchema = z.object({
  name: z.string().max(255).optional().nullable(),
  overview: z.string().optional().nullable(),
  airDate: z.coerce.date().optional().nullable(), // تبدیل رشته به Date
  // seasonNumber و episodeCount معمولاً توسط TMDB تعیین می‌شوند و نباید دستی آپدیت شوند
  // posterPath جداگانه آپدیت می‌شود
});
