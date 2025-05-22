// client/src/components/landing/LandingPage.tsx
'use client';

import React, { SetStateAction, Dispatch } from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import EmailSignupForm from './SubscriptionCta ';
import FAQ from './FAQ';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import HeroSection from './HeroSection';
import TrendingSection from './TrendingSection';
import FeaturesSection from './FeaturesSection';
import FaqSection from './FAQ';
import SubscriptionCta from './SubscriptionCta ';
import { MediaItem } from '@/types';

// ایجاد تم با پشتیبانی RTL
const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'IRANSans, Roboto, Arial',
  },
});

// پیکربندی کش برای RTL
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});
interface landingPageProps {
  heroItems: MediaItem[];
  isLoadingHero: boolean;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isCheckingEmail: boolean;
  top10Movies: MediaItem[];
  isLoadingTop10Movies: boolean;
}

const LandingPage = ({
  heroItems,
  isLoadingHero,
  handleSubmit,
  setEmail,
  email,
  isCheckingEmail,
  top10Movies,
  isLoadingTop10Movies,
}: landingPageProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleEmailSubmit = (email: string) => {
    console.log('Email submitted:', email);
    // TODO: اضافه کردن منطق ثبت‌نام
  };

  return (
    <Box sx={{ bgcolor: '#141414', minHeight: '100vh', color: 'white' }}>
      <HeroSection
        items={heroItems}
        isLoading={isLoadingHero}
        handleSubmit={handleSubmit}
        setEmail={setEmail}
        isCheckingEmail={isCheckingEmail}
        email={email}
      />
      <TrendingSection
        topMovies={top10Movies}
        isLoading={isLoadingTop10Movies}
      />
      <FeaturesSection />
      <FaqSection />
      <SubscriptionCta
        handleSubmit={handleSubmit}
        setEmail={setEmail}
        isCheckingEmail={isCheckingEmail}
        email={email}
      />
    </Box>
  );
};

export default LandingPage;
