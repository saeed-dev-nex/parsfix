'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Paper,
  Grid,
  Fade,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { MediaItem } from '@/data/mockData'; // مسیر mockData را اصلاح کنید

interface FeaturedContentSectionProps {
  item: MediaItem;
}

export default function FeaturedContentSection({
  item,
}: FeaturedContentSectionProps) {
  if (!item) return null;

  return (
    <Fade
      in
      timeout={1000}
    >
      <Paper
        elevation={6}
        sx={{
          my: 5,
          p: { xs: 2, sm: 3, md: 4 },
          bgcolor: 'rgba(20, 20, 20, 0.7)', // پس‌زمینه کمی شفاف‌تر
          backdropFilter: 'blur(8px)',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden', // برای اینکه گرادینت از کادر بیرون نزند
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&::before': {
            // افکت گرادینت پس‌زمینه
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, transparent 100%), url(${item.backdropPath})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top', // تمرکز روی بالای تصویر پس‌زمینه
            filter: 'blur(3px) brightness(0.7)', // کمی محو و تاریک کردن پس‌زمینه
            transform: 'scale(1.05)', // برای پوشش کامل
          },
        }}
      >
        <Grid
          container
          spacing={3}
          sx={{ position: 'relative', zIndex: 1, alignItems: 'center' }}
        >
          {/* پوستر فیلم/سریال */}
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{ display: 'flex', justifyContent: 'center' }}
          >
            <Box
              component='img'
              src={item.posterPath}
              alt={item.title}
              sx={{
                width: '100%',
                maxWidth: { xs: 200, sm: 250, md: 300 },
                height: 'auto',
                aspectRatio: '2/3',
                objectFit: 'cover',
                borderRadius: 2,
                boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
              }}
            />
          </Grid>

          {/* اطلاعات و دکمه‌ها */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography
              variant='h3'
              component='h2'
              sx={{
                fontWeight: 'bold',
                color: 'white',
                mb: 1.5,
                textShadow: '2px 2px 6px rgba(0,0,0,0.6)',
              }}
            >
              {item.title}
            </Typography>
            {item.tagline && (
              <Typography
                variant='subtitle1'
                sx={{
                  color: 'grey.300',
                  mb: 2,
                  fontStyle: 'italic',
                  textShadow: '1px 1px 4px rgba(0,0,0,0.4)',
                }}
              >
                {item?.tagline}
              </Typography>
            )}
            <Stack
              direction='row'
              spacing={1}
              alignItems='center'
              sx={{ mb: 2 }}
              flexWrap='wrap'
            >
              {item.genres.map((genre) => (
                <Chip
                  key={genre}
                  label={genre}
                  size='small'
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'grey.200' }}
                />
              ))}
              {item.releaseYear && (
                <Typography
                  variant='body2'
                  sx={{ color: 'grey.400' }}
                >
                  • {item.releaseYear}
                </Typography>
              )}
              {item.duration && (
                <Typography
                  variant='body2'
                  sx={{ color: 'grey.400' }}
                >
                  •{' '}
                  {item.duration.startsWith('S')
                    ? item.duration
                    : item.duration
                        .replace('h ', 'ساعت و ')
                        .replace('m', ' دقیقه')}
                </Typography>
              )}
            </Stack>
            <Typography
              variant='body1'
              paragraph
              sx={{
                color: 'grey.200',
                lineHeight: 1.7,
                maxHeight: '7.5em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {item.description}
            </Typography>
            <Stack
              direction='row'
              spacing={2}
              sx={{ mt: 3 }}
            >
              <Button
                variant='contained'
                color='primary'
                size='large'
                startIcon={<PlayArrowIcon />}
                sx={{
                  borderRadius: '25px',
                  px: { xs: 3, md: 4 },
                  py: 1,
                  fontWeight: 'bold',
                }}
              >
                پخش
              </Button>
              <Button
                variant='outlined'
                size='large'
                startIcon={<InfoOutlinedIcon />}
                sx={{
                  borderRadius: '25px',
                  px: { xs: 3, md: 4 },
                  py: 1,
                  borderColor: 'rgba(255,255,255,0.7)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.08)',
                  },
                }}
              >
                اطلاعات بیشتر
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Fade>
  );
}
