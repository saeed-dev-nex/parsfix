// client/src/components/landing/HeroSection.tsx (یا هر مسیری که قرار دارد)
'use client';
import { useState, useEffect, useRef, SetStateAction, Dispatch } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  useMediaQuery,
  useTheme,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronRight'; // آیکون برای RTL مناسب است
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'; // در RTL به صورت خودکار برعکس می‌شود؟ باید تست شود یا از آیکون دیگری استفاده کرد
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation } from 'swiper/modules';
import { styled, alpha } from '@mui/material/styles'; // alpha را ایمپورت کنید
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import { MediaItem } from '@/types';
import { ChevronRight, Movie, Tv } from '@mui/icons-material';

// --- Styled Components با استفاده از Theme ---

// TextField استایل‌دار با استفاده از theme و alpha
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    // استفاده از رنگ خاکستری تیره تم با شفافیت
    backgroundColor: alpha(theme.palette.grey[900], 0.7), // یا theme.palette.common.black
    // backdropFilter: 'blur(4px)', // در صورت نیاز
    color: theme.palette.common.white,
    height: '56px', // ارتفاع ثابت ممکن است بماند
    borderRadius: theme.shape.borderRadius, // استفاده از شعاع گردی تم
    '& fieldset': {
      borderColor: alpha(theme.palette.common.white, 0.2),
    },
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.common.white, 0.3),
    },
    '&.Mui-focused fieldset': {
      borderColor: alpha(theme.palette.common.white, 0.5), // یا theme.palette.primary.main
    },
  },
  '& .MuiInputLabel-root': {
    color: alpha(theme.palette.common.white, 0.7),
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: alpha(theme.palette.common.white, 0.9), // یا theme.palette.primary.main
  },
}));

// دکمه Get Started با استفاده از رنگ اصلی تم
const GetStartedButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main, // رنگ اصلی تم (قرمز)
  color: theme.palette.common.white,
  fontWeight: 'bold',
  height: '56px',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0, 3),
  fontSize: '1.2rem',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark, // رنگ تیره تر اصلی تم
  },
  whiteSpace: 'nowrap',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
  },
}));

// کامپوننت لوگوی N - استفاده از رنگ اصلی تم
const ParsflixLogo = styled('div')(({ theme }) => ({
  color: theme.palette.common.white, // متن سفید
  fontWeight: 900,
  fontSize: '1rem',
  backgroundColor: theme.palette.primary.main, // پس زمینه قرمز تم
  padding: theme.spacing(0.6, 1.2), // استفاده از theme.spacing
  width: '25px', // اندازه ثابت ممکن است بماند
  height: '25px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // marginRight: theme.spacing(1), // استفاده از theme.spacing // در RTL خودکار marginLeft می شود
}));

// استایل BulletContainer - استفاده از theme.spacing و بررسی RTL برای right/left
const BulletContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  bottom: theme.spacing(3), // 24px -> theme.spacing(3)
  // اگر تم RTL باشد left، وگرنه right
  ...(theme.direction === 'rtl'
    ? { left: theme.spacing(4) }
    : { right: theme.spacing(4) }), // 32px -> theme.spacing(4)
  zIndex: 10,
  gap: theme.spacing(1.5), // 12px -> theme.spacing(1.5)
  [theme.breakpoints.down('sm')]: {
    bottom: theme.spacing(2), // 16px
    ...(theme.direction === 'rtl'
      ? { left: theme.spacing(2) }
      : { right: theme.spacing(2) }),
  },
}));

// استایل ProgressBar - استفاده از theme و alpha
const ProgressBar = styled(Box)<{ active: string; progress: number }>(
  ({ theme, active, progress }) => ({
    width: '60px', // اندازه ثابت ممکن است بماند
    height: '2px',
    backgroundColor: alpha(theme.palette.common.white, 0.2),
    borderRadius: theme.shape.borderRadius * 2, // کمی گردتر
    position: 'relative',
    overflow: 'hidden',
    // نوار پیشرفت داخلی
    '&::after': {
      content: '""',
      position: 'absolute',
      // اگر تم RTL باشد left، وگرنه right (برای شروع پروگرس)
      ...(theme.direction === 'rtl' ? { right: 0 } : { left: 0 }),
      top: 0,
      height: '100%',
      width: `${progress}%`,
      backgroundColor:
        active === 'true'
          ? theme.palette.common.white
          : alpha(theme.palette.common.white, 0.5),
      transition: 'width 0.1s linear', // انیمیشن ممکن است در RTL نیاز به تنظیم داشته باشد
      borderRadius: theme.shape.borderRadius * 2,
    },
  })
);

// استایل SlideNumber - استفاده از رنگ تم
const SlideNumber = styled(Box)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 700,
  color: theme.palette.common.white,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '30px',
}));

interface heroSectionProps {
  items: MediaItem[];
  isLoading: boolean;
  setEmail: Dispatch<SetStateAction<string>>;
  email: string;
  isCheckingEmail: boolean;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

// --- کامپوننت اصلی HeroSection ---
const HeroSection: React.FC<heroSectionProps> = ({
  items,
  isLoading,
  isCheckingEmail,
  setEmail,
  email,
  handleSubmit,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [swiperKey, setSwiperKey] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(100);
  const swiperRef = useRef<SwiperType | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // تابع ساخت URL تصویر - بدون تغییر (فقط مطمئن شوید تصاویر در دسترس هستند)
  const imageGenerate = (id: number, width: number, height: number): string => {
    // TODO: آدرس دهی تصاویر خودتان را اینجا قرار دهید
    // return `/images/hero-slide-${id}.jpg`;
    return `https://via.assets.so/movie.png?id=${id}&q=95&w=${width}&h=${height}&fit=fill`; // Placeholder
  };

  // تابع زمانسنج پیشرفت - منطق بدون تغییر
  const startProgressTimer = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    const startTime = Date.now();
    const duration = 5000; // 5 ثانیه
    setProgress(100);
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPercent = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remainingPercent);
      if (remainingPercent <= 0) {
        if (progressInterval.current) clearInterval(progressInterval.current);
      }
    }, 16);
  };
  useEffect(() => {
    if (items && items.length > 0) {
      setSwiperKey((prevKey) => prevKey + 1); // تغییر key برای re-mount
    }
  }, [items]);

  useEffect(() => {
    startProgressTimer();
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [activeIndex]);

  if (isLoading) {
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0,0,0,.65)',
      }}
    >
      <CircularProgress />
    </Box>;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        height: {
          xs: '75vh',
          sm: '80vh',
          md: '85vh',
          lg: 'calc(100vh - 64px)',
        },
        overflow: 'hidden',
      }}
    >
      {/* Swiper اصلی - بدون تغییر زیاد در props */}
      <Swiper
        modules={[Autoplay, EffectFade, Navigation]}
        effect='fade'
        speed={1000}
        loop
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.realIndex);
        }}
        style={{ height: '100%' }}
        key={items ? items.length : 'empty'}
      >
        {isLoading && items.length === 0 ? ( // اگر در حال لود اولیه و آیتم نیست
          <Box
            sx={{
              height: '70vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress />
          </Box>
        ) : !isLoading && items.length === 0 ? (
          <Box
            sx={{
              height: '70vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography color='text.secondary'>
              محتوایی برای اسلایدر یافت نشد.
            </Typography>
          </Box>
        ) : (
          items.map((slide) => (
            <SwiperSlide key={slide.id}>
              <Box sx={{ position: 'relative', height: '100%' }}>
                {/* لایه تصویر پس زمینه */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: theme.palette.common.black, // پس زمینه مشکی
                    backgroundImage: `url(${slide.backdropPath})`,
                    backgroundSize: 'cover', // تغییر به cover برای پر کردن بهتر
                    backgroundPosition: 'center center',
                    zIndex: 1,
                    // opacity: 0.9, // به جای opacity از گرادینت استفاده می کنیم
                  }}
                />
                {/* لایه گرادینت تیره */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    // گرادینت برای RTL و LTR تنظیم می شود
                    background: `linear-gradient(to ${
                      theme.direction === 'rtl' ? 'left' : 'right'
                    }, ${alpha(theme.palette.common.black, 0.95)} 0%, ${alpha(
                      theme.palette.common.black,
                      0.6
                    )} 50%, ${alpha(theme.palette.common.black, 0.2)} 100%)`,
                    zIndex: 2,
                  }}
                />
                {/* محتوای متنی روی لایه ها */}
                <Container
                  maxWidth='lg'
                  sx={{ position: 'relative', zIndex: 3, height: '100%' }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      // alignItems: 'flex-start', // برای RTL باید flex-end باشد (MUI معمولا خودکار انجام میدهد)
                      height: '100%',
                      pt: { xs: 12, md: 8 },
                      pb: { xs: 6, md: 8 },
                      maxWidth: { xs: '100%', md: '650px' }, // عرض محتوا
                      // textAlign: 'left', // برای RTL باید right باشد (MUI معمولا خودکار انجام میدهد)
                      color: theme.palette.common.white, // رنگ متن اصلی سفید
                    }}
                  >
                    {/* لوگو و عنوان سریال */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ParsflixLogo>
                        {slide.type === 'movie' ? 'M' : 'S'}
                      </ParsflixLogo>{' '}
                      {/* استفاده از کامپوننت لوگو */}
                      <Typography
                        variant='caption'
                        sx={{
                          color: alpha(theme.palette.common.white, 0.7),
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          letterSpacing: '1px',
                        }}
                      >
                        {slide.type === 'movie' ? 'فیلم' : 'سریال'}
                      </Typography>
                    </Box>

                    {/* عنوان اصلی */}
                    <Typography
                      variant={isMobile ? 'h3' : 'h2'}
                      component='h1'
                      sx={{
                        fontWeight: 900,
                        mb: 2,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        letterSpacing: '1px',
                      }}
                    >
                      {slide.title}
                    </Typography>

                    {/* اطلاعات متا (سال، رده سنی، ...) */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        gap: 2,
                        color: alpha(theme.palette.common.white, 0.9),
                      }}
                    >
                      <Typography>{slide.releaseYear}</Typography>
                      <Typography
                        sx={{
                          border: `1px solid ${alpha(
                            theme.palette.common.white,
                            0.3
                          )}`,
                          px: 0.5,
                          fontSize: '0.8rem',
                          color: alpha(theme.palette.common.white, 0.7),
                        }}
                      >
                        {slide.ageRating}
                      </Typography>
                      {/* <Typography>Show</Typography> */}
                      {
                        slide.genres &&
                          slide.genres.length > 0 &&
                          slide.genres.map((g, i) => (
                            <Typography
                              sx={{
                                padding: '2px 8px',
                                background: 'rgba(0,0,0,.75)',
                                border: '1px solid #F1F1F1',
                                borderRadius: '15px',
                              }}
                              key={i}
                            >
                              {g}
                            </Typography>
                          ))
                        // نمایش فقط دسته اول برای سادگی
                      }
                    </Box>

                    {/* توضیحات */}
                    <Typography
                      variant='body1'
                      sx={{
                        mb: 3,
                        maxWidth: '550px',
                        lineHeight: 1.6, // افزایش line-height
                        textShadow: '1px 1px 2px rgba(0,0,0,0.7)', // سایه قوی تر
                      }}
                    >
                      {slide.description}
                    </Typography>

                    {/* متن درخواست ایمیل */}
                    <Typography
                      variant='h6'
                      sx={{ mb: 3, fontWeight: 700 }}
                    >
                      آماده تماشا هستید؟ برای ایجاد یا راه‌اندازی مجدد اشتراک
                      خود، ایمیل خود را وارد کنید.
                    </Typography>

                    {/* فرم ایمیل */}
                    <Box
                      component='form'
                      onSubmit={handleSubmit}
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'stretch', sm: 'center' },
                        width: '100%',
                        gap: { xs: 2, sm: 0.5 },
                      }}
                    >
                      <StyledTextField
                        label='آدرس ایمیل'
                        type='email'
                        variant='outlined'
                        fullWidth
                        value={email}
                        onChange={handleEmailChange}
                      />
                      <GetStartedButton
                        type='submit'
                        variant='contained'
                        endIcon={<ChevronRight />}
                      >
                        {' '}
                        {/* استفاده از آیکون مناسب RTL */}
                        شروع کنید
                      </GetStartedButton>
                    </Box>
                  </Box>
                </Container>
              </Box>
            </SwiperSlide>
          ))
        )}
      </Swiper>

      {/* نشانگرهای اسلاید */}
      <BulletContainer>
        {items.map((slide, index) => (
          <Box
            key={slide.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              opacity: activeIndex === index ? 1 : 0.6,
              transition: 'opacity 0.3s ease',
              cursor: 'pointer',
            }}
            onClick={() => {
              if (swiperRef.current) swiperRef.current.slideToLoop(index);
            }} // استفاده از slideToLoop
          >
            <SlideNumber>{(index + 1).toString().padStart(2, '0')}</SlideNumber>
            <ProgressBar
              active={(activeIndex === index).toString()}
              progress={
                activeIndex === index
                  ? progress
                  : swiperRef.current &&
                    swiperRef.current.progress * 100 < 5 &&
                    activeIndex === (index + 1) % items.length
                  ? 100
                  : activeIndex > index
                  ? 0
                  : 100
              }
            />
          </Box>
        ))}
      </BulletContainer>
    </Box>
  );
};

export default HeroSection;
// Remove the local setEmail implementation since it's handled via props
