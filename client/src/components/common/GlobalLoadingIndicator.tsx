import React from 'react';
import { Backdrop, CircularProgress, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledBackdrop = styled(Backdrop)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1, // بالاتر از سایر عناصر
  // استفاده از رنگ تیره نیمه‌شفاف به جای سفید پیش‌فرض
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(3px)', // افکت بلور برای زیبایی
  color: '#fff',
}));

const LoadingBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem', // فاصله بین اسپینر و متن
});

const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main, // استفاده از رنگ اصلی تم (قرمز)
}));

export default function GlobalLoadingIndicator({ open }: { open: boolean }) {
  return (
    <StyledBackdrop open={open}>
      <LoadingBox>
        {/* می‌توانید از انیمیشن یا لوگوی سفارشی هم استفاده کنید */}
        <StyledCircularProgress
          size={60}
          thickness={4}
        />
        <Typography
          variant='h6'
          component='div'
          sx={{ mt: 1, fontWeight: 'medium' }}
        >
          در حال بارگذاری...
        </Typography>
      </LoadingBox>
    </StyledBackdrop>
  );
}
