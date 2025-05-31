'use client';

import React from 'react';
import { Box, Container, Typography } from '@mui/material';

import HeroSlider from '../../pageContent/HeroSlider';
import ContentCarousel from '@/components/pageContent/ContentCarousel';
import FeaturedContentSection from '@/components/pageContent/FeaturedContentSection';
import { AuthError, MediaItem } from '@/types';
// import ContentCarousel from '@/components/pageContent/ContentCarousel'; // برای مراحل بعدی

interface LoggedInHomePageProps {
  heroItems: MediaItem[];
  trendingMovies: MediaItem[];
  recommendedShows: MediaItem[];
  featuredItem: MediaItem;
  isLoadingHero: boolean;
  top10Movies: MediaItem[];
  top10Series: MediaItem[];
  isLoadingTopMovies: boolean;
  isLoadingTopSeries: boolean;
  isLoadingTrendingMovies?: boolean;
  isLoadingRecommendedShows?: boolean;
  isLoadingFeatured?: boolean;
  upcomingMovies: MediaItem[];
  isLoadingUpcomingMovies: boolean;
  upcomingSeries: MediaItem[];
  isLoadingUpcomingSeries: boolean;
  homepageError?: string | null;
}

export default function LoggedInHomePage({
  heroItems,
  trendingMovies,
  recommendedShows,
  featuredItem,
  isLoadingHero,
  top10Movies,
  top10Series,
  isLoadingTopMovies,
  isLoadingTopSeries,
  isLoadingTrendingMovies,
  isLoadingRecommendedShows,
  isLoadingFeatured,
  upcomingMovies,
  isLoadingUpcomingMovies,
  upcomingSeries,
  isLoadingUpcomingSeries,
  homepageError,
}: LoggedInHomePageProps) {
  // const featuredItem = mockHeroData[1] || mockTrendingMovies[0];
  return (
    <Box sx={{ bgcolor: '#141414', minHeight: '100vh', width: '100%' }}>
      <HeroSlider
        items={heroItems}
        isLoading={isLoadingHero}
      />

      <Container
        maxWidth='xl'
        sx={{ py: 2, px: { xs: 1, sm: 2, md: 4 } }}
      >
        {/* --- اضافه کردن کاروسل Top 10 --- */}
        <ContentCarousel
          title='Top 10 فیلم امروز'
          items={top10Movies}
          isLoading={isLoadingTopMovies}
          idSuffix='top10Movies'
          // پراپ جدید برای ارسال به MediaCard جهت نمایش رتبه
          itemProps={{ displayRank: true }}
        />
        {/* ------------------------------ */} {/* پدینگ بهتر */}
        <ContentCarousel
          title='فیلم‌های پرطرفدار'
          items={trendingMovies}
          idSuffix='trending'
        />
        {featuredItem && <FeaturedContentSection item={featuredItem} />}
        <ContentCarousel
          title='سریال‌های پیشنهادی'
          items={recommendedShows}
          idSuffix='recommended'
        />
        {/* --- اضافه کردن کاروسل Top 10 --- */}
        <ContentCarousel
          title='Top 10 سریال امروز'
          items={top10Series}
          isLoading={isLoadingTopSeries}
          idSuffix='top10Series'
          // پراپ جدید برای ارسال به MediaCard جهت نمایش رتبه
          itemProps={{ displayRank: true }}
        />
        <ContentCarousel
          title='فیلم های در انتظار اکران'
          items={upcomingMovies}
          idSuffix='upcoming'
        />
        {/* می‌توانید ردیف‌های دیگری اضافه کنید */}
      </Container>
    </Box>
  );
}
