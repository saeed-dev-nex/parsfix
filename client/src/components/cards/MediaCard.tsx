'use client';

import React from 'react';
import {
  Card,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Stack,
  Chip,
  Tooltip,
  Fade,
} from '@mui/material';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite'; // آیکن پخش بزرگتر
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // یا InfoIcon
import { MediaItem } from '@/data/mockData'; // مسیر mockData را اصلاح کنید

interface MediaCardProps {
  item: MediaItem;
  displayRank?: boolean;
  rank?: number;
}

export default function MediaCard({
  item,
  displayRank = false,
  rank,
}: MediaCardProps) {
  const [isLiked, setIsLiked] = React.useState(false); // وضعیت لایک (نمونه)

  return (
    <Box
      sx={{ position: 'relative', display: 'flex', alignItems: 'flex-start' }}
    >
      {displayRank && rank && (
        <Typography
          sx={{
            position: 'absolute',
            top: '5px',
            left: '5px',
            zIndex: 3,
            /* ... استایل‌های قبلی برای نمایش رتبه ... */
            fontSize: { xs: '3rem', sm: '4rem', md: '5rem' }, // کمی کوچکتر برای تطابق بهتر
            WebkitTextStroke: `1.5px ${rank <= 3 ? '#E50914' : 'grey.700'}`,
            transform: 'translateX(20%)',
            mr: '-15px', // تنظیم دقیق‌تر
          }}
        >
          {rank}
        </Typography>
      )}
      {item.imdbRating && (
        <Box
          sx={{
            position: 'absolute',
            top: '5px',
            right: '10px',
            zIndex: 3,
            bgcolor: 'rgba(0,0,0,0.5)',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0.5,
            border: '1px solid white',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.8rem',
              fontWight: 'bold',
            }}
          >
            {item.imdbRating}
          </Typography>
        </Box>
      )}
      <Card
        sx={{
          position: 'relative',
          width: { xs: 140, sm: 170, md: 190, lg: 210 },
          minWidth: { xs: 140, sm: 170, md: 190, lg: 210 },
          aspectRatio: '2/3', // حفظ نسبت تصویر پوستر
          bgcolor: '#181818',
          borderRadius: '6px',
          overflow: 'hidden', // مهم برای slide-up panel
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          transition:
            'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          zIndex: displayRank ? 2 : 1,
          cursor: 'pointer',
          '&:hover': {
            transform: displayRank
              ? 'scale(1.18) translateX(-8px) translateY(-8px)'
              : 'scale(1.12) translateY(-10px)',
            boxShadow: '0 15px 30px rgba(0,0,0,0.7)',
            zIndex: 10, // بالاتر از بقیه کارت‌ها در هاور
            '& .media-card-info-panel': {
              // نمایش پنل اطلاعات
              transform: 'translateY(0)',
              opacity: 1,
            },
            '& .media-card-play-button-overlay': {
              // نمایش دکمه پخش مرکزی
              opacity: 1,
            },
          },
        }}
      >
        <CardMedia
          component='img'
          image={item.posterPath}
          alt={item.title}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease-in-out', // افکت زوم عکس هنگام هاور روی کارت
            '.MuiCard-root:hover &': {
              // زوم شدن عکس هنگام هاور روی کارت
              transform: 'scale(1.05)',
            },
          }}
        />

        {/* دکمه پخش مرکزی که با هاور ظاهر می‌شود */}
        <Box
          className='media-card-play-button-overlay'
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0,
            transition: 'opacity 0.3s ease-in-out',
            zIndex: 2, // روی تصویر
          }}
        >
          <IconButton
            sx={{
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              border: '2px solid white',
              '&:hover': {
                bgcolor: 'rgba(229, 9, 20, 0.8)',
                transform: 'scale(1.1)',
              },
              transition: 'transform 0.2s ease',
            }}
          >
            <PlayCircleFilledWhiteIcon sx={{ fontSize: '3rem' }} />
          </IconButton>
        </Box>

        {/* پنل اطلاعات که از پایین با هاور اسلاید می‌شود */}
        <Box
          className='media-card-info-panel'
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: -1,
            bgcolor: 'rgba(18, 18, 18, 0.9)', // پس‌زمینه نیمه‌شفاف تیره
            backdropFilter: 'blur(4px)',
            color: 'white',
            p: 1.5,
            transform: 'translateY(100%)', // در حالت عادی مخفی (پایین کارت)
            opacity: 0,
            transition:
              'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease-in-out',
            zIndex: 3, // روی دکمه پخش مرکزی
          }}
        >
          <Typography
            variant='subtitle2'
            fontWeight='bold'
            noWrap
            gutterBottom
          >
            {item.title}
          </Typography>
          <Stack
            direction='row'
            spacing={1}
            alignItems='center'
            sx={{ mb: 1 }}
            flexWrap='wrap'
          >
            {item.isNew && (
              <Chip
                label='جدید'
                color='primary'
                size='small'
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  bgcolor: 'primary.main',
                }}
              />
            )}
            <Typography
              variant='caption'
              sx={{ color: 'grey.400' }}
            >
              {item.releaseYear}
            </Typography>
            {item.duration && (
              <Typography
                variant='caption'
                sx={{ color: 'grey.400' }}
              >
                •{' '}
                {item.duration.startsWith('S')
                  ? item.duration
                  : item.duration.replace('h ', 'ساعت ').replace('m', 'دقیقه')}
              </Typography>
            )}
            {item.ageRating && (
              <Chip
                label={item.ageRating}
                size='small'
                variant='outlined'
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  borderColor: 'grey.600',
                  color: 'grey.300',
                }}
              />
            )}
          </Stack>
          <Stack
            direction='row'
            justifyContent='flex-start'
            alignItems='center'
            spacing={0.5}
          >
            <Tooltip title='افزودن به لیست'>
              <IconButton
                size='small'
                sx={{
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                <AddCircleOutlineIcon sx={{ fontSize: '1.4rem' }} />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={isLiked ? 'حذف از علاقه‌مندی' : 'افزودن به علاقه‌مندی'}
            >
              <IconButton
                size='small'
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                sx={{
                  color: isLiked ? 'primary.main' : 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                {isLiked ? (
                  <FavoriteIcon sx={{ fontSize: '1.3rem' }} />
                ) : (
                  <FavoriteBorderIcon sx={{ fontSize: '1.3rem' }} />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title='اطلاعات بیشتر'>
              <IconButton
                size='small'
                sx={{
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  ml: 'auto' /* دکمه اطلاعات بیشتر در سمت راست */,
                }}
              >
                <ExpandMoreIcon sx={{ fontSize: '1.5rem' }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
}
