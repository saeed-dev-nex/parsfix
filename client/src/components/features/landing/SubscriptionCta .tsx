'use client';
import React, { SetStateAction, useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Dispatch } from 'react';
import { ArrowForward } from '@mui/icons-material';

// استایل برای فرم ورود ایمیل
const StyledTextField = styled(TextField)`
  & .MuiFilledInput-root {
    background-color: rgba(22, 22, 22, 0.8);
    backdrop-filter: blur(4px);
    color: white;
    height: 56px;
    border-radius: 4px;
    &:hover {
      background-color: rgba(30, 30, 30, 0.8);
    }
    &.Mui-focused {
      background-color: rgba(30, 30, 30, 0.9);
      border-color: #e50914;
    }
  }
  & .MuiFilledInput-input {
    color: white;
    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
      opacity: 1;
    }
  }
  width: {
    xs: '100%',
    sm: '320px',
    md: '460px',
    lg: '560px',
    xl: '560px',
  };`;

// استایل برای دکمه شروع
const GetStartedButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#e50914',
  color: 'white',
  fontWeight: 'bold',
  height: '56px',
  borderRadius: '4px',
  padding: theme.spacing(0, 3),
  fontSize: '1.1rem',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#f40612',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(229, 9, 20, 0.3)',
  },
  transition: 'all 0.3s ease',
  whiteSpace: 'nowrap',
  minWidth: '140px',
}));

// استایل برای بخش پشت زمینه
const BackgroundGradient = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background:
    'linear-gradient(to bottom, rgba(15,15,25,1) 0%, rgba(20,20,30,1) 100%)',
  zIndex: -1,
}));

// استایل برای باکس اصلی
const StyledPaper = styled(Paper)(({ theme }) => ({
  background:
    'linear-gradient(145deg, rgba(20,20,30,0.9) 0%, rgba(30,30,45,0.8) 100%)',
  backdropFilter: 'blur(10px)',
  padding: theme.spacing(6, 4),
  borderRadius: '16px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
  border: '1px solid rgba(255,255,255,0.05)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '3px',
    background: 'linear-gradient(90deg, #e50914, #ff5f6d)',
    transition: 'all 0.5s ease-in-out',
  },
  '&:hover::before': {
    left: 0,
  },
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 50px rgba(0,0,0,0.3)',
  },
}));

// استایل برای برچسب‌های ویژگی‌ها
const FeatureTag = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: 'rgba(255,255,255,0.05)',
  padding: theme.spacing(1, 2),
  borderRadius: '30px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: 'translateY(-3px)',
  },
}));

interface SubscriptionCtaProps {
  setEmail: Dispatch<SetStateAction<string>>;
  email: string;
  isCheckingEmail: boolean;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const SubscriptionCta: React.FC<SubscriptionCtaProps> = ({
  setEmail,
  email,
  isCheckingEmail,
  handleSubmit,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        py: { xs: 8, md: 12 },
        overflow: 'hidden',
        backgroundImage:
          'radial-gradient(circle at 25% 25%, rgba(50,50,70,0.05) 0%, transparent 15%), radial-gradient(circle at 75% 75%, rgba(50,50,70,0.05) 0%, transparent 15%)',
        backgroundSize: '40px 40px',
      }}
    >
      {/* پس زمینه */}
      <BackgroundGradient />

      {/* دکوراسیون پس زمینه */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '300px',
          height: '300px',
          background:
            'radial-gradient(circle, rgba(229, 9, 20, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
          animation: 'pulse 8s infinite ease-in-out',
          '@keyframes pulse': {
            '0%': { opacity: 0.5, transform: 'scale(1)' },
            '50%': { opacity: 0.7, transform: 'scale(1.05)' },
            '100%': { opacity: 0.5, transform: 'scale(1)' },
          },
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: '250px',
          height: '250px',
          background:
            'radial-gradient(circle, rgba(229, 9, 20, 0.03) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
          animation: 'pulse 10s infinite ease-in-out alternate',
        }}
      />

      <Container
        maxWidth='lg'
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <StyledPaper elevation={8}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              component='h2'
              sx={{
                fontWeight: 900,
                mb: 2,
                background: 'linear-gradient(90deg, #ffffff, #e6e6e6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
                textShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
            >
              آماده شروع تماشا هستید؟
            </Typography>
            <Typography
              variant='body1'
              sx={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                maxWidth: '90%',
                mx: 'auto',
                mb: 1,
                lineHeight: 1.6,
              }}
            >
              عضویت در پارس‌فلیکس آسان است. فقط آدرس ایمیل خود را وارد کنید.
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: 'rgba(255,255,255,0.6)',
                mb: 3,
              }}
            >
              اکنون آماده‌اید؟ فرم زیر را تکمیل کنید تا اشتراک خود را ایجاد یا
              فعال کنید.
            </Typography>
          </Box>

          <Box
            component='form'
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'center',
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2,
              mx: 'auto',
              maxWidth: { xs: '100%', sm: '85%', md: '80%' },
            }}
          >
            <StyledTextField
              type='email'
              variant='filled'
              placeholder='آدرس ایمیل خود را وارد کنید'
              value={email}
              onChange={handleEmailChange}
              fullWidth={isMobile}
              InputProps={{
                disableUnderline: true,
              }}
            />
            <GetStartedButton
              type='submit'
              variant='contained'
              endIcon={<ArrowForward />}
              fullWidth={isMobile}
            >
              شروع کنید
            </GetStartedButton>
          </Box>

          <Box
            sx={{
              mt: 5,
              display: 'flex',
              justifyContent: 'center',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: { xs: 2, md: 4 },
            }}
          >
            <FeatureTag>
              <CheckCircleOutlineIcon sx={{ color: '#e50914' }} />
              <Typography
                variant='body2'
                sx={{ color: 'rgba(255,255,255,0.8)' }}
              >
                بدون قرارداد
              </Typography>
            </FeatureTag>
            <FeatureTag>
              <CheckCircleOutlineIcon sx={{ color: '#e50914' }} />
              <Typography
                variant='body2'
                sx={{ color: 'rgba(255,255,255,0.8)' }}
              >
                لغو آسان عضویت
              </Typography>
            </FeatureTag>
            <FeatureTag>
              <CheckCircleOutlineIcon sx={{ color: '#e50914' }} />
              <Typography
                variant='body2'
                sx={{ color: 'rgba(255,255,255,0.8)' }}
              >
                دسترسی نامحدود
              </Typography>
            </FeatureTag>
          </Box>
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default SubscriptionCta;
