// client/src/app/(public)/browse/page.tsx
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// کامپوننت فرضی برای نمایش ردیف فیلم ها
// import MovieRow from '@/components/movies/MovieRow';

export default function BrowsePage() {
  // TODO: Fetch user-specific data (watchlist, recommendations, etc.)

  return (
    <Box sx={{ padding: 4 }}>
      <Typography
        variant='h4'
        component='h1'
        gutterBottom
      >
        داشبورد اصلی پارس‌فلیکس (صفحه Browse)
      </Typography>
      <Typography
        variant='body1'
        sx={{ mb: 3 }}
      >
        خوش آمدید! محتوای اصلی برای کاربر لاگین شده اینجا نمایش داده می‌شود.
      </Typography>

      {/* TODO: نمایش ردیف‌های فیلم و سریال */}
      {/* <MovieRow title="ادامه تماشا" /> */}
      {/* <MovieRow title="محبوب‌ترین‌ها" /> */}
      {/* <MovieRow title="جدیدترین‌ها" /> */}
    </Box>
  );
}
