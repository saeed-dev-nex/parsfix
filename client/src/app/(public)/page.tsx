'use client';
import LoggedInHomePage from '@/components/features/home/LoggedInHomePage';
import { Box, CircularProgress } from '@mui/material'; // برای استایل پس زمینه احتمالی
import LandingPage from '@/components/features/landing/LandingPage';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAuthIsLoading,
  selectCurrentUser,
} from '@/store/slices/authSlice';
import { AuthError, User } from '@/types';
import { AppDispatch, RootState } from '@/store/store';
import {
  clearHomepageError,
  fetchFeaturedItem,
  fetchHeroSliderItems,
  fetchRecommendedShows,
  fetchTop10Movies,
  fetchTop10Series,
  fetchTrendingMovies,
  selectFeaturedItem,
  selectHeroSliderItems,
  selectHomepageError,
  selectIsLoadingFeatured,
  selectIsLoadingHero,
  selectIsLoadingRecommendedShows,
  selectIsLoadingTop10Movies,
  selectIsLoadingTop10Series,
  selectIsLoadingTrendingMovies,
  selectRecommendedShows,
  selectTop10Movies,
  selectTop10Series,
  selectTrendingMovies,
} from '@/store/slices/homepageSlice';
import { useEffect, useState } from 'react';
import { apiPost } from '@/lib/apiHelper';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector(selectCurrentUser);
  const isLoading = useSelector(selectAuthIsLoading);
  // --- Reading data from Redux state ---
  const heroItems = useSelector(selectHeroSliderItems);
  const trendingMovies = useSelector(selectTrendingMovies);
  const recommendedShows = useSelector(selectRecommendedShows);
  const featuredItem = useSelector(selectFeaturedItem);

  // --- Reading loading states ---
  const isLoadingHero = useSelector(selectIsLoadingHero);
  const isLoadingTrending = useSelector(selectIsLoadingTrendingMovies);
  const isLoadingRecommended = useSelector(selectIsLoadingRecommendedShows);
  const isLoadingFeatured = useSelector(selectIsLoadingFeatured);
  const homepageError = useSelector(selectHomepageError);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const top10Movies = useSelector(selectTop10Movies);
  const top10Series = useSelector(selectTop10Series);
  const isLoadingTopMovies = useSelector(selectIsLoadingTop10Movies);
  const isLoadingTopSeries = useSelector(selectIsLoadingTop10Series);

  // --- واکشی داده‌ها هنگام mount شدن کامپوننت ---
  useEffect(() => {
    dispatch(fetchHeroSliderItems());
    dispatch(fetchTrendingMovies());
    dispatch(fetchRecommendedShows());
    dispatch(fetchFeaturedItem());
    dispatch(fetchTop10Movies());
    dispatch(fetchTop10Series());

    return () => {
      dispatch(clearHomepageError()); // پاک کردن خطا هنگام خروج
    };
  }, [dispatch]);
  // -----------------------------------------

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: '#101010',
        }}
      >
        <CircularProgress color='primary' />
      </Box>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCheckingEmail(true);
    setError(null);

    try {
      console.log(`[LandingPage] Checking email: ${email}`);
      const responseData = await apiPost('/auth/check-email', { email });

      if (responseData?.status === 'success' && responseData?.data) {
        const {
          exists,
          isActivated,
          isBlocked,
          email: checkedEmail,
        } = responseData.data;
        console.log('[LandingPage] Check email response:', responseData.data);

        if (isBlocked) {
          // اگر کاربر مسدود است، یک پیام خطا نمایش بده و هدایت نکن
          setError(
            'حساب کاربری شما مسدود شده است. لطفاً با پشتیبانی تماس بگیرید.'
          );
          setIsCheckingEmail(false);
          return;
        }

        if (exists) {
          // اگر کاربر وجود دارد (و مسدود نیست)، به صفحه ورود هدایت کن
          // می‌توانید ایمیل را هم به عنوان query param بفرستید
          router.push(`/login?email=${encodeURIComponent(checkedEmail)}`);
        } else {
          // اگر کاربر وجود ندارد، به صفحه ثبت‌نام هدایت کن
          router.push(`/signup?email=${encodeURIComponent(checkedEmail)}`);
        }
        // setIsLoading(false) در اینجا لازم نیست چون کاربر هدایت می‌شود
      } else {
        // اگر پاسخ سرور ساختار مورد انتظار را نداشت
        throw new Error(
          responseData?.message || 'پاسخ نامعتبر از سرور دریافت شد.'
        );
      }
    } catch (err: any) {
      console.error('[LandingPage] Error checking email:', err);
      const apiErr = err as AuthError; // تایپ خطا از apiHelper
      setError(
        apiErr.message || 'خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.'
      );
      setIsCheckingEmail(false);
    }
  };

  // تصمیم‌گیری بر اساس وضعیت ورود کاربر
  if (!currentUser) {
    return (
      <Box
        sx={{
          bgcolor: '#141414',
          minHeight: 'calc(100vh - 64px - 72px)' /* ارتفاع منو و فوتر کم شود */,
          color: 'white',
        }}
      >
        {' '}
        {/* ارتفاع تقریبی */}
        <LandingPage
          heroItems={heroItems}
          isLoadingHero={isLoadingHero}
          handleSubmit={handleSubmit}
          email={email}
          setEmail={setEmail}
          isCheckingEmail={isCheckingEmail}
          top10Movies={top10Movies}
          isLoadingTop10Movies={isLoadingTopMovies}
        />
      </Box>
    );
  } else {
    // کاربر وارد شده است: نمایش صفحه اصلی داشبورد
    const userWithStringId = { ...currentUser, id: String(currentUser.id) };
    if (!featuredItem) return null;

    return (
      <LoggedInHomePage
        user={userWithStringId as User}
        heroItems={heroItems}
        trendingMovies={trendingMovies}
        recommendedShows={recommendedShows}
        featuredItem={featuredItem}
        isLoadingHero={isLoadingHero}
        isLoadingTrendingMovies={isLoadingTrending}
        isLoadingRecommendedShows={isLoadingRecommended}
        isLoadingFeatured={isLoadingFeatured}
        homepageError={homepageError}
        top10Movies={top10Movies}
        top10Series={top10Series}
        isLoadingTopMovies={isLoadingTopMovies}
        isLoadingTopSeries={isLoadingTopSeries}
      />
    ); // اطلاعات کاربر را پاس می‌دهیم
  }
}
