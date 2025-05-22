'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Fade,
  Rating,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { MediaItem } from '@/types';

interface HeroSlideProps {
  item: MediaItem;
  isActive: boolean; // برای کنترل انیمیشن‌ها وقتی اسلاید فعال است
}

export default function HeroSlide({ item, isActive }: HeroSlideProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
  };

  console.log(item);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: {
          xs: '75vh',
          sm: '80vh',
          md: '85vh',
          lg: 'calc(100vh - 64px)',
        }, // 64px ارتفاع Navbar
        backgroundImage: `url(${item.backdropPath})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        padding: '10px',
        '&::before': {
          // ایجاد یک لایه گرادینت تیره روی عکس برای خوانایی متن
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 80%, rgba(0,0,0,0) 100%)',
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: { xs: 0, md: '15px' },
          bottom: '20vh',
          zIndex: 1,
          maxWidth: { xs: '90%', md: '650px' },
          width: '100%',
          backdropFilter: 'blur(10px)',
          padding: '10px',
          p: { xs: 2, sm: 3, md: 3 },
          borderRadius: '16px',
          bgcolor: 'rgba(0,0,0,0.4)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.3s ease',
          // marginBottom: { xs: '10vh', sm: '15vh', md: '25vh' },
          // marginRight: { xs: 0, sm: '10%', md: '35%', lg: '60%' },
        }}
      >
        <Fade
          in={isActive}
          timeout={1000}
        >
          <Box>
            {item.heroTitleImage ? (
              <Box
                component='img'
                src={item.heroTitleImage}
                alt={`${item.title} logo`}
                sx={{
                  width: { xs: '60%', sm: '70%', md: '350px' },
                  height: 'auto',
                  mb: 2,
                  filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.5))',
                }}
              />
            ) : (
              <Typography
                variant='h2'
                component='h1'
                sx={{
                  fontWeight: 'bold',
                  mb: 1,
                  textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
                  background:
                    'linear-gradient(45deg, #a06119 10%, #FF9100 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {item.title}
              </Typography>
            )}

            {item.heroSubtitle && (
              <Typography
                variant='h6'
                sx={{
                  mb: 2,
                  color: 'grey.300',
                  fontWeight: 'normal',
                  textShadow: '1px 1px 4px rgba(0,0,0,0.5)',
                }}
              >
                {item.heroSubtitle}
              </Typography>
            )}

            {item.imdbRating && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating
                  value={item.imdbRating / 2}
                  precision={0.5}
                  readOnly
                  icon={
                    <StarIcon
                      fontSize='inherit'
                      sx={{ color: '#FFC107' }}
                    />
                  }
                  emptyIcon={<StarBorderIcon fontSize='inherit' />}
                  sx={{ mr: 1 }}
                />
                <Typography
                  variant='h6'
                  component='span'
                  sx={{ color: '#FFC107', fontWeight: 'bold' }}
                >
                  {item.imdbRating}/10
                </Typography>
                <Typography
                  variant='body2'
                  sx={{ ml: 1, color: 'grey.400' }}
                >
                  IMDb
                </Typography>
                {item.views && (
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                    <VisibilityIcon
                      sx={{ fontSize: '1rem', color: 'grey.400', mr: 0.5 }}
                    />
                    <Typography
                      variant='body2'
                      sx={{ color: 'grey.400' }}
                    >
                      {item.views.toLocaleString()} بازدید
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            <Stack
              direction='row'
              spacing={1}
              sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}
            >
              {item.isNew && (
                <Chip
                  label='جدید'
                  color='error'
                  size='small'
                  sx={{ bgcolor: 'primary.main', color: 'white' }}
                />
              )}
              {item.ageRating && (
                <Chip
                  label={item.ageRating}
                  size='small'
                  variant='outlined'
                  sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}
                />
              )}
              {item.genres &&
                item.genres.map((genre, index) => (
                  <Chip
                    key={index}
                    label={genre}
                    size='small'
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      my: 0.5,
                    }}
                  />
                ))}
            </Stack>

            <Stack
              direction='row'
              spacing={1}
              sx={{ mb: 2 }}
            >
              {item.releaseYear && (
                <Typography
                  variant='body2'
                  sx={{ color: 'grey.400' }}
                >
                  {item.releaseYear}
                </Typography>
              )}
              {item.duration && (
                <Typography
                  variant='body2'
                  sx={{ color: 'grey.400' }}
                >
                  • {item.duration}
                </Typography>
              )}
              {item.country && (
                <Typography
                  variant='body2'
                  sx={{ color: 'grey.400' }}
                >
                  • {item.country}
                </Typography>
              )}
            </Stack>

            <Typography
              variant='body1'
              paragraph
              sx={{
                color: 'grey.200',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                display: { xs: 'none', sm: 'block' },
                maxHeight: '6em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                mb: 3,
                lineHeight: 1.6,
              }}
            >
              {item.description}
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mt: 3 }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <Button
                variant='contained'
                color='primary'
                size='large'
                startIcon={<PlayArrowIcon />}
                sx={{
                  borderRadius: '20px',
                  px: 4,
                  py: 1,
                  fontWeight: 'bold',
                  background:
                    'linear-gradient(45deg, #FF4081 30%, #FF9100 90%)',
                  boxShadow: '0 3px 15px rgba(255, 64, 129, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background:
                      'linear-gradient(45deg, #FF4081 40%, #FF9100 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 5px 20px rgba(255, 64, 129, 0.6)',
                  },
                }}
              >
                پخش
              </Button>
              <Button
                variant='outlined'
                size='large'
                startIcon={<InfoOutlinedIcon />}
                sx={{
                  borderRadius: '20px',
                  px: 3,
                  py: 1,
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                اطلاعات بیشتر
              </Button>
              <Button
                variant='outlined'
                size='large'
                startIcon={
                  isFavorite ? (
                    <FavoriteIcon sx={{ color: '#FF4081' }} />
                  ) : (
                    <FavoriteBorderIcon />
                  )
                }
                onClick={handleFavoriteClick}
                sx={{
                  borderRadius: '20px',
                  minWidth: { xs: 'auto', sm: '48px' },
                  px: { xs: 3, sm: 2 },
                  py: 1,
                  borderColor: isFavorite ? '#FF4081' : 'rgba(255,255,255,0.3)',
                  color: isFavorite ? '#FF4081' : 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#FF4081',
                    color: '#FF4081',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box
                  component='span'
                  sx={{ display: { xs: 'inline', sm: 'none' }, ml: 1 }}
                >
                  علاقه‌مندی
                </Box>
              </Button>
              <Button
                variant='outlined'
                size='large'
                startIcon={<ShareIcon />}
                sx={{
                  borderRadius: '20px',
                  minWidth: { xs: 'auto', sm: '48px' },
                  px: { xs: 3, sm: 2 },
                  py: 1,
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#2196F3',
                    color: '#2196F3',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box
                  component='span'
                  sx={{ display: { xs: 'inline', sm: 'none' }, ml: 1 }}
                >
                  اشتراک‌گذاری
                </Box>
              </Button>
            </Stack>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}
