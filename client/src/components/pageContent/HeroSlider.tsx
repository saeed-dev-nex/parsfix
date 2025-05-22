'use client';
import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css/effect-fade';
import 'swiper/css/thumbs';
import { Box } from '@mui/material';
import HeroSlide from './HeroSlide';
import { MediaItem } from '@/types';

interface HeroSliderProps {
  items: MediaItem[];
  isLoading: boolean;
}

export default function HeroSlider({ items, isLoading }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const mainSwiperRef = useRef<SwiperType | null>(null);

  // تابع برای تغییر اسلاید با کلیک روی تصویر بندانگشتی
  const handleThumbClick = (index: number) => {
    if (mainSwiperRef.current) {
      mainSwiperRef.current.slideTo(index);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* اسلایدر اصلی */}
      <Box
        sx={{
          width: '100%',
          height: {
            xs: '75vh',
            sm: '80vh',
            md: '85vh',
            lg: 'calc(100vh - 64px)',
          },
          position: 'relative',
        }}
      >
        <Swiper
          modules={[Pagination, Autoplay, EffectFade, Thumbs]}
          autoplay={{ delay: 7000, disableOnInteraction: false }}
          effect='fade'
          fadeEffect={{ crossFade: true }}
          onSwiper={(swiper) => {
            mainSwiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          thumbs={{ swiper: thumbsSwiper }}
          navigation={false}
          pagination={{ clickable: true, dynamicBullets: true }}
          loop
          spaceBetween={0}
          slidesPerView={1}
          style={{ width: '100%', height: '100%' }}
        >
          {items.map((item, index) => (
            <SwiperSlide key={item.id}>
              <HeroSlide
                item={item}
                isActive={index === activeIndex}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* اسلایدر بندانگشتی */}
      <Box
        sx={{
          position: 'absolute',
          right: { xs: '50%', md: '5%' },
          bottom: { xs: '5%', md: '5%' },
          transform: {
            xs: 'translateX(50%)',
            md: 'translateX(0)',
          },
          zIndex: 10,
          width: { xs: '90%', sm: '80%', md: '920px' },
          height: 'auto',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            p: 1,
            backgroundColor: 'rgba(18, 18, 18, 0.8)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Swiper
            modules={[Thumbs]}
            onSwiper={setThumbsSwiper}
            spaceBetween={4}
            slidesPerView='auto'
            direction='horizontal'
            watchSlidesProgress
            style={{ width: '100%', height: '100%' }}
            breakpoints={{
              320: { slidesPerView: 2 },
              480: { slidesPerView: 2.5 },
              768: { slidesPerView: 3 },
              900: { slidesPerView: 3.5 },
              1280: { slidesPerView: 4 },
            }}
          >
            {items.map((item, index) => (
              <SwiperSlide
                key={item.id}
                style={{ width: 'auto', height: 'auto' }}
              >
                <Box
                  onClick={() => handleThumbClick(index)}
                  sx={{
                    position: 'relative',
                    height: { xs: '80px', sm: '90px', md: '100px' },
                    width: { xs: '140px', sm: '160px', md: '180px' },
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border:
                      index === activeIndex
                        ? '2px solid #FF4081'
                        : '2px solid transparent',
                    transition: 'all 0.3s ease',
                    transform:
                      index === activeIndex ? 'scale(1.05)' : 'scale(1)',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      border: '2px solid rgba(255, 64, 129, 0.7)',
                    },
                  }}
                >
                  <Box
                    component='img'
                    src={item.posterPath || item.backdropPath}
                    alt={item.title}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'all 0.3s ease',
                      filter:
                        index === activeIndex
                          ? 'brightness(100%)'
                          : 'brightness(70%)',
                      '&:hover': {
                        filter: 'brightness(100%)',
                        transform: 'scale(1.1)',
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 0.5,
                      background:
                        'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                      textAlign: 'center',
                    }}
                  >
                    <Box
                      component='span'
                      sx={{
                        color: 'white',
                        fontSize: { xs: '10px', sm: '12px' },
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px black',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.title}
                    </Box>
                  </Box>
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Box>
    </Box>
  );
}
