'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules'; // FreeMode برای اسکرول روان
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';
import { Box, Typography, IconButton } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import MediaCard from '../cards/MediaCard'; // کامپوننت کارت
import { MediaItem } from '@/data/mockData';

interface ContentCarouselProps {
  title: string;
  items: MediaItem[] | [];
  idSuffix: string; // برای یکتا کردن ID دکمه‌های ناوبری
  itemProps?: any;
  isLoading?: boolean;
}

export default function ContentCarousel({
  title,
  items,
  idSuffix,
  itemProps,
  isLoading,
}: ContentCarouselProps) {
  const navigationPrevEl = `.swiper-button-prev-${idSuffix}`;
  const navigationNextEl = `.swiper-button-next-${idSuffix}`;

  // if (!items || items.length === 0) return null; // اگر آیتمی نبود، رندر نکن

  return (
    <Box sx={{ my: 4, position: 'relative' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
          px: { xs: 0, md: 1 },
        }}
      >
        <Typography
          variant='h5'
          sx={{ fontWeight: 'bold', color: 'white' }}
        >
          {title}
        </Typography>
        {/* دکمه‌های ناوبری سفارشی (خارج از Swiper برای کنترل بهتر) */}
        <Box>
          <IconButton
            className={navigationPrevEl.substring(1)}
            sx={{
              color: 'grey.500',
              '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
            }}
            size='small'
          >
            <NavigateNextIcon />
          </IconButton>
          <IconButton
            className={navigationNextEl.substring(1)}
            sx={{
              color: 'grey.500',
              '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
            }}
            size='small'
          >
            <NavigateBeforeIcon />
          </IconButton>
        </Box>
      </Box>
      <Swiper
        modules={[Navigation, FreeMode]}
        spaceBetween={16} // فاصله بین کارت‌ها
        slidesPerView={'auto'} // نمایش تعداد کارت بر اساس عرض آن‌ها و کانتینر
        freeMode={true} // فعال کردن اسکرول روان با ماوس/تاچ
        navigation={{
          prevEl: navigationPrevEl,
          nextEl: navigationNextEl,
        }}
        grabCursor={true}
        style={{ paddingBottom: '10px' }} // کمی فضا برای سایه کارت‌ها
        // Breakpoints برای تنظیمات مختلف در اندازه‌های صفحه
        breakpoints={{
          320: { slidesPerView: 2.2, spaceBetween: 10 },
          480: { slidesPerView: 2.5, spaceBetween: 10 },
          640: { slidesPerView: 3.5, spaceBetween: 16 },
          768: { slidesPerView: 4.2, spaceBetween: 16 },
          1024: { slidesPerView: 5.2, spaceBetween: 16 },
          1280: { slidesPerView: 6.2, spaceBetween: 16 },
        }}
      >
        {isLoading ? (
          <Box
            component='div'
            sx={{ height: '100%' }}
          >
            Loading...
          </Box>
        ) : !items || items.length === 0 ? (
          <Box
            component='div'
            sx={{ height: '100%' }}
          >
            No items found
          </Box>
        ) : (
          items.map((item, index) => (
            <SwiperSlide
              key={item.id}
              style={{ width: 'auto' }}
            >
              {/* پاس دادن itemProps به MediaCard */}
              <MediaCard
                item={item}
                rank={index + 1}
                {...itemProps}
              />
            </SwiperSlide>
          ))
        )}
      </Swiper>
    </Box>
  );
}
