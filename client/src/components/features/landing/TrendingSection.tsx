// client/src/components/landing/TrendingSection.tsx (یا مسیر دیگر)
'use client';
import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  useTheme,
  Container,
  useMediaQuery,
  Button,
  IconButton,
  Theme,
} from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  Navigation,
  Autoplay,
  EffectCoverflow,
  Pagination,
} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import { styled, alpha } from '@mui/material/styles'; // alpha را ایمپورت کنید
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import FiberNewOutlinedIcon from '@mui/icons-material/FiberNewOutlined';
import LooksOneIcon from '@mui/icons-material/LooksOne'; // یا آیکون رتبه دیگر
import { MediaItem } from '@/types';

// --- Styled Components با استفاده از Theme ---

const CustomSectionTitle = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(8),
  paddingBottom: theme.spacing(2),
  textAlign: 'center',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60px', // اندازه ثابت
    height: '3px',
    // استفاده از رنگ های Primary و Secondary تم
    background: `linear-gradient(to right, ${
      theme.palette.secondary?.main || theme.palette.error.main
    } 0%, ${theme.palette.primary.main} 100%)`,
    transition: 'width 0.5s ease-in-out',
  },
  '&:hover::after': {
    width: '100%',
  },
  [theme.breakpoints.down('md')]: {
    marginBottom: theme.spacing(5),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'transparent', // بدون پس زمینه
  color: theme.palette.common.white,
  position: 'relative',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  borderRadius: theme.spacing(2), // 16px -> theme.spacing(2)
  boxShadow: theme.shadows[4], // استفاده از سایه تم (مثلا شماره 4)
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)', // افکت هاور
    boxShadow: theme.shadows[8], // سایه قوی تر در هاور
    '& .MuiCardMedia-root': {
      transform: 'scale(1.1)',
      filter: 'brightness(0.8) contrast(1.2)',
    },
    '& .overlay-content': {
      // این کلاس استفاده نشده بود، شاید TitleOverlay منظور بوده؟
      opacity: 1,
      transform: 'translateY(0)',
    },
    '& .rank-number': {
      transform: `scale(1.2) translateX(${
        theme.direction === 'rtl' ? '5px' : '-5px'
      })`, // جابجایی X بر اساس RTL
      textShadow: `0 0 20px ${alpha(
        theme.palette.secondary?.main || theme.palette.error.main,
        0.7
      )}`, // استفاده از رنگ Secondary/Error
    },
    '& .quick-controls': {
      opacity: 1,
      transform: 'translateY(0)',
    },
    '& .title-overlay': {
      background: `linear-gradient(to top, ${alpha(
        theme.palette.common.black,
        0.95
      )} 0%, ${alpha(
        theme.palette.common.black,
        0.6
      )} 60%, rgba(0,0,0,0) 100%)`,
      height: '70%',
    },
    '& .badge-new': {
      transform: 'rotate(10deg) scale(1.2)',
    },
  },
}));

const RankNumber = styled(Typography)(({ theme }) => ({
  fontSize: '6rem', // کمی کوچکتر شد
  fontWeight: 900,
  position: 'absolute',
  bottom: theme.spacing(1.25), // 10px
  // بر اساس RTL
  ...(theme.direction === 'rtl'
    ? { right: theme.spacing(1.875) }
    : { left: theme.spacing(1.875) }), // 15px
  zIndex: 2,
  textShadow: `3px 3px 10px ${alpha(
    theme.palette.common.black,
    0.7
  )}, -1px -1px 0 ${alpha(theme.palette.common.white, 0.2)}`,
  color: 'transparent',
  WebkitTextStroke: `2px ${alpha(theme.palette.common.white, 0.7)}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  opacity: 0.9,
}));

const TitleOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2), // کمی کمتر شد
  background: `linear-gradient(to top, ${alpha(
    theme.palette.common.black,
    0.9
  )} 0%, ${alpha(theme.palette.common.black, 0.3)} 70%, rgba(0,0,0,0) 100%)`,
  height: '50%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '& .MuiTypography-root': {
    textShadow: `0px 2px 4px ${alpha(theme.palette.common.black, 0.8)}`,
  },
}));

const QuickControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  opacity: 0,
  transform: 'translateY(20px)',
  transition: 'all 0.3s ease-in-out 0.1s',
  marginTop: theme.spacing(1), // کمی کمتر شد
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.common.white, 0.2),
  // backdropFilter: 'blur(8px)', // در صورت نیاز
  color: theme.palette.common.white,
  border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.3),
  },
  transition: 'all 0.2s ease',
}));

const PlayButton = styled(Button)(({ theme }) => ({
  borderRadius: '30px', // گردی خاص ممکن است بماند
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(3),
  backgroundColor: theme.palette.common.white, // سفید
  color: theme.palette.common.black, // متن مشکی
  fontWeight: 'bold',
  boxShadow: theme.shadows[3], // استفاده از سایه تم
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.9), // کمی شفاف در هاور
    transform: 'scale(1.05)',
  },
  transition: 'all 0.2s ease',
}));

// بج "جدید" با رنگ error تم
const StyledBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1.25), // 10px
  // بر اساس RTL
  ...(theme.direction === 'rtl'
    ? { left: theme.spacing(1.25) }
    : { right: theme.spacing(1.25) }),
  zIndex: 3,
  backgroundColor: theme.palette.error.main, // استفاده از رنگ error تم
  color: theme.palette.error.contrastText, // استفاده از رنگ متن متضاد error
  padding: theme.spacing(0.5, 1), // 4px 8px
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5), // 4px
  fontSize: '0.75rem',
  fontWeight: 'bold',
  boxShadow: theme.shadows[1],
  transition: 'transform 0.3s ease-in-out',
  '&.badge-new': {}, // کلاس برای افکت هاور اگر لازم باشد
}));

// بج "برتر هفته" با رنگ primary تم
const TopTenBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1.25),
  // بر اساس RTL
  ...(theme.direction === 'rtl'
    ? { right: theme.spacing(1.25) }
    : { left: theme.spacing(1.25) }),
  zIndex: 3,
  backgroundColor: theme.palette.primary.main, // رنگ اصلی تم
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  fontSize: '0.75rem',
  fontWeight: 'bold',
  boxShadow: theme.shadows[1],
}));

// --- بقیه کامپوننت و منطق ---

// تابع ساخت URL تصویر - بدون تغییر
const imageGenerate = (id: number, width: number, height: number): string => {
  // TODO: آدرس دهی تصاویر خودتان
  return `https://via.assets.so/movie.png?id=${id}&q=95&w=${width}&h=${height}&fit=fill`;
};

// استایل های Swiper با استفاده از Theme و alpha
const swiperStyles = (theme: Theme) => ({
  // تبدیل به تابع برای دسترسی به theme
  padding: theme.spacing(5, 0), // 40px -> theme.spacing(5)
  '& .swiper-pagination': {
    bottom: '0px', // ممکن است بماند
  },
  '& .swiper-pagination-bullet': {
    backgroundColor: alpha(theme.palette.common.white, 0.7),
    opacity: 0.5,
    transition: 'all 0.3s ease',
  },
  '& .swiper-pagination-bullet-active': {
    backgroundColor: theme.palette.common.white,
    opacity: 1,
    transform: 'scale(1.2)',
  },
  '& .swiper-button-next, & .swiper-button-prev': {
    color: theme.palette.common.white,
    backgroundColor: alpha(theme.palette.common.black, 0.5), // استفاده از alpha
    width: '40px',
    height: '40px', // اندازه ثابت
    borderRadius: '50%',
    '&::after': { fontSize: '20px' }, // اندازه ثابت
    '&:hover': {
      // استفاده از رنگ Secondary یا Primary تم
      backgroundColor: alpha(
        theme.palette.secondary?.main || theme.palette.primary.main,
        0.8
      ),
    },
    transition: 'all 0.3s ease',
  },
  // تنظیمات برای RTL در دکمه‌های next/prev (Swiper معمولا خودش مدیریت می‌کند)
  // '& .swiper-button-prev': { /* ... */ },
  // '& .swiper-button-next': { /* ... */ },
});
interface TrendingSectionProps {
  topMovies: MediaItem[];
  isLoading: boolean;
}
const TrendingSection: React.FC<TrendingSectionProps> = ({
  topMovies,
  isLoading,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery('(max-width: 1024px)'); // این breakpoint ممکن است نیاز به تعریف در تم داشته باشد
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<any>(null);

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10, lg: 12 },
        // استفاده از رنگ های پس زمینه تم
        background: `linear-gradient(to bottom, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* پترن زمینه با رنگ های تم */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // استفاده از رنگ های Primary و Secondary تم با شفافیت کم
          backgroundImage: `radial-gradient(circle at 25% 25%, ${alpha(
            theme.palette.primary.dark,
            0.05
          )} 0%, transparent 10%), radial-gradient(circle at 75% 75%, ${alpha(
            theme.palette.secondary?.dark || theme.palette.primary.dark,
            0.05
          )} 0%, transparent 10%)`,
          backgroundSize: '40px 40px', // اندازه ثابت
          opacity: 0.5,
          zIndex: 0,
        }}
      />

      <Container
        maxWidth='lg'
        sx={{ position: 'relative', zIndex: 1 }}
      >
        {/* عنوان بخش */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
          <CustomSectionTitle>
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              component='h2'
              sx={{ fontWeight: 900, color: theme.palette.text.primary }} // استفاده از رنگ متن اصلی تم
            >
              10 فیلم برتر هفته
            </Typography>
          </CustomSectionTitle>
        </Box>

        {/* Swiper */}
        {/* پاس دادن theme به تابع استایل */}
        <Box sx={swiperStyles(theme)}>
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={isMobile ? 1.2 : isTablet ? 2.5 : 3.5} // نمایش بخشی از اسلاید بعدی/قبلی
            loop={true}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2.5,
              slideShadows: false,
            }}
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            navigation={true} // فعال کردن دکمه های پیش فرض Navigation
            onSwiper={(swiper) => {
              /* @ts-ignore */ swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => {
              setActiveIndex(swiper.realIndex);
            }}
            modules={[EffectCoverflow, Pagination, Autoplay, Navigation]}
            className='mySwiper' // برای استایل‌های خاص اگر لازم باشد
          >
            {isLoading && topMovies.length === 0 ? (
              <Typography sx={{ color: 'white', textAlign: 'center', my: 3 }}>
                در حال بارگذاری ۱۰ فیلم برتر...
              </Typography>
            ) : !isLoading && topMovies.length === 0 ? (
              <Typography sx={{ color: 'white', textAlign: 'center', my: 3 }}>
                هیچ فیلمی برای نمایش وجود ندارد.
              </Typography>
            ) : (
              topMovies.map((movie, index) => (
                <SwiperSlide key={movie.id}>
                  {/* کارت فیلم */}
                  <StyledCard>
                    <CardMedia
                      component='img'
                      height={isMobile ? 400 : 500} // ارتفاع تطبیقی
                      image={movie.posterPath}
                      alt={movie.title}
                      sx={{
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    />
                    {/* بج جدید */}
                    {movie.isNew && (
                      <StyledBadge className='badge-new'>
                        <FiberNewOutlinedIcon fontSize='small' /> جدید
                      </StyledBadge>
                    )}
                    {/* بج ۱۰ برتر */}
                    {index <= 10 && ( // یا منطق رتبه بندی واقعی
                      <TopTenBadge>
                        <LooksOneIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> ۱۰
                        برتر
                      </TopTenBadge>
                    )}
                    {/* شماره رتبه */}
                    <RankNumber className='rank-number'>{index + 1}</RankNumber>

                    {/* لایه عنوان و اطلاعات */}
                    <TitleOverlay className='title-overlay'>
                      <Typography
                        variant={isMobile ? 'h6' : 'h5'}
                        sx={{ fontWeight: 'bold', mb: 0.5 }}
                      >
                        {movie.title}
                      </Typography>
                      {/* متا دیتا */}
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1,
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant='body2'
                          sx={{
                            color:
                              theme.palette.secondary?.main ||
                              theme.palette.error.main,
                            fontWeight: 'bold',
                          }}
                        >
                          {movie.imdbRating}
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{ color: alpha(theme.palette.common.white, 0.7) }}
                        >
                          {movie.releaseYear}
                        </Typography>
                      </Box>
                      {/* تگ ها */}
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1,
                          flexWrap: 'wrap',
                          mb: 1,
                          maxHeight: '2.5em',
                          overflow: 'hidden',
                        }}
                      >
                        {movie.genres.map((gener, idx) => (
                          <Typography
                            key={idx}
                            variant='caption'
                            sx={{
                              backgroundColor: alpha(
                                theme.palette.common.white,
                                0.1
                              ),
                              padding: '2px 8px',
                              borderRadius: theme.shape.borderRadius,
                              color: alpha(theme.palette.common.white, 0.9),
                            }}
                          >
                            {gener}
                          </Typography>
                        ))}
                      </Box>
                      {/* دکمه های کنترل سریع */}
                      <QuickControls className='quick-controls'>
                        <PlayButton
                          variant='contained'
                          startIcon={<PlayArrowIcon />}
                        >
                          پخش
                        </PlayButton>
                        <ActionButton size='small'>
                          <AddIcon />
                        </ActionButton>
                        <ActionButton size='small'>
                          <ThumbUpAltOutlinedIcon />
                        </ActionButton>
                        <ActionButton size='small'>
                          <InfoOutlinedIcon />
                        </ActionButton>
                      </QuickControls>
                    </TitleOverlay>
                  </StyledCard>
                </SwiperSlide>
              ))
            )}
          </Swiper>
        </Box>

        {/* نقاط تزئینی با رنگ های تم */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            ...(theme.direction === 'rtl' ? { right: '5%' } : { left: '5%' }), // تنظیم بر اساس RTL
            width: '200px',
            height: '200px',
            background: `radial-gradient(circle, ${alpha(
              theme.palette.primary.dark,
              0.05
            )} 0%, transparent 70%)`, // رنگ Primary
            borderRadius: '50%',
            zIndex: 0,
            display: { xs: 'none', md: 'block' },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            ...(theme.direction === 'rtl' ? { left: '8%' } : { right: '8%' }), // تنظیم بر اساس RTL
            width: '150px',
            height: '150px',
            background: `radial-gradient(circle, ${alpha(
              theme.palette.secondary?.dark || theme.palette.error.dark,
              0.05
            )} 0%, transparent 70%)`, // رنگ Secondary/Error
            borderRadius: '50%',
            zIndex: 0,
            display: { xs: 'none', md: 'block' },
          }}
        />
      </Container>
    </Box>
  );
};

export default TrendingSection;
