"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SendIcon from "@mui/icons-material/Send";
import {
  ArrowCircleLeftOutlined,
  Instagram,
  Language,
  LinkedIn,
  Send,
  Telegram,
  Twitter,
} from "@mui/icons-material";

// کانتینر فوتر - هماهنگ با تم
const FooterContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(8, 0, 4), // استفاده از theme.spacing
  overflow: "hidden",
  // استفاده از رنگ پس‌زمینه تم یا گرادینت بر اساس آن
  background: `linear-gradient(to top, ${
    theme.palette.background.default
  } 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
  // استفاده از رنگ divider تم برای بوردر بالا
  borderTop: `1px solid ${theme.palette.divider}`,
  "&::before": {
    // خط تزئینی بالا
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    // استفاده از رنگ اصلی تم برای گرادینت
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, transparent)`,
    zIndex: 1,
  },
}));

// لینک‌های فوتر - هماهنگ با تم
const StyledLink = styled("a")(({ theme }) => ({
  display: "block",
  marginBottom: theme.spacing(1.5),
  // استفاده از رنگ متن ثانویه تم
  color: theme.palette.text.secondary,
  textDecoration: "none",
  fontSize: "0.9rem", // می‌تواند از theme.typography بیاید
  transition: "all 0.2s ease",
  position: "relative",
  paddingRight: theme.spacing(1), // در RTL می‌شود paddingLeft
  "&:hover": {
    // استفاده از رنگ متن اصلی تم در هاور
    color: theme.palette.text.primary,
    transform: "translateX(-4px)", // این افکت ممکن است در RTL نیاز به تنظیم داشته باشد
  },
  "&::before": {
    // خط کوچک کنار لینک در هاور
    content: '""',
    position: "absolute",
    left: 0, // در RTL می‌شود left: 0
    top: "50%",
    transform: "translateY(-50%)",
    width: "0",
    height: "1px",
    // استفاده از رنگ اصلی تم
    backgroundColor: theme.palette.primary.main,
    transition: "width 0.3s ease",
  },
  "&:hover::before": {
    width: "4px",
  },
}));

// دکمه‌های شبکه‌های اجتماعی - هماهنگ با تم
const SocialButton = styled(IconButton)(({ theme }) => ({
  // استفاده از رنگ متن ثانویه تم
  color: theme.palette.text.secondary,
  // استفاده از رنگ پس‌زمینه کاغذ تم با شفافیت
  backgroundColor: alpha(theme.palette.background.paper, 0.5), // یا alpha(theme.palette.common.white, 0.05)
  margin: theme.spacing(0, 0.5), // مارجین با واحد تم
  transition: "all 0.3s ease",
  "&:hover": {
    // پس‌زمینه کمی روشن‌تر در هاور
    backgroundColor: alpha(theme.palette.background.paper, 0.7), // یا alpha(theme.palette.common.white, 0.1)
    // استفاده از رنگ اصلی تم در هاور
    color: theme.palette.primary.main,
    transform: "translateY(-3px)",
  },
}));

// دکمه اسکرول به بالا - هماهنگ با تم
const ScrollTopButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  left: theme.spacing(4), // فاصله با واحد تم
  bottom: theme.spacing(4),
  // استفاده از رنگ اصلی تم با شفافیت
  backgroundColor: alpha(theme.palette.primary.main, 0.8),
  // استفاده از رنگ متضاد برای آیکون
  color: theme.palette.primary.contrastText,
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.primary.main, // رنگ کامل در هاور
    transform: "translateY(-5px)",
    // استفاده از سایه تم
    boxShadow: theme.shadows[6],
  },
}));

// لوگوی فوتر - هماهنگ با تم
const FooterLogo = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  // استفاده از رنگ‌های تم برای گرادینت متن
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${
    theme.palette.secondary.light || theme.palette.primary.light
  })`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  marginBottom: theme.spacing(4), // مارجین با واحد تم
}));

// عنوان ستون‌های فوتر - هماهنگ با تم
const FooterTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  textTransform: "uppercase",
  fontSize: "0.8rem", // می‌تواند از theme.typography بیاید
  letterSpacing: "1px",
  marginBottom: theme.spacing(2), // مارجین با واحد تم
  // استفاده از رنگ متن اصلی تم
  color: theme.palette.text.primary,
}));

// کامپوننت فوتر
const Footer: React.FC = () => {
  // تایپ FC اضافه شد
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // isTablet استفاده نشده بود

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // داده‌های فوتر (بدون تغییر)
  const footerGroups = [
    {
      title: "دسترسی سریع",
      links: ["صفحه اصلی", "فیلم‌ها", "سریال‌ها", "تازه‌ها", "لیست من"],
    },
    {
      title: "اطلاعات",
      links: [
        "درباره ما",
        "تماس با ما",
        "سوالات متداول",
        "حریم خصوصی",
        "شرایط استفاده",
      ],
    },
    {
      title: "پشتیبانی",
      links: [
        "مرکز راهنما",
        "شیوه‌های پرداخت",
        "اشتراک‌ها",
        "لغو اشتراک",
        "بازپرداخت‌ها",
      ],
    },
    {
      title: "قانونی",
      links: [
        "حق کپی‌رایت",
        "اطلاعیه‌های قانونی",
        "سیاست کوکی‌ها",
        "گزارش تخلف",
        "امنیت",
      ],
    },
  ];

  return (
    <FooterContainer>
      <Container maxWidth='lg'>
        {/* بخش بالایی فوتر: لوگو، توضیحات، شبکه‌های اجتماعی، خبرنامه */}
        <Box
          sx={{
            mb: 6,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "center", md: "flex-end" },
            textAlign: { xs: "center", md: "left" }, // در RTL می‌شود 'left'
          }}
        >
          {/* بخش لوگو و توضیحات */}
          <Box>
            <FooterLogo variant={isMobile ? "h5" : "h4"}>پارس‌فلیکس</FooterLogo>
            <Typography
              variant='body2'
              sx={{
                // استفاده از رنگ متن ثانویه تم
                color: "text.secondary",
                maxWidth: "400px",
                mb: 2,
              }}
            >
              پارس‌فلیکس، بهترین پلتفرم پخش آنلاین فیلم و سریال‌های ایرانی و
              خارجی با زیرنویس و دوبله فارسی
            </Typography>
            {/* آیکون‌های شبکه‌های اجتماعی */}
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "flex-end" },
                mb: { xs: 4, md: 0 },
              }}
            >
              <SocialButton size='small' aria-label='Instagram'>
                <Instagram fontSize='small' />
              </SocialButton>
              <SocialButton size='small' aria-label='Twitter'>
                <Twitter fontSize='small' />
              </SocialButton>
              <SocialButton size='small' aria-label='Telegram'>
                <Telegram fontSize='small' />
              </SocialButton>
              <SocialButton size='small' aria-label='LinkedIn'>
                <LinkedIn fontSize='small' />
              </SocialButton>
            </Box>
          </Box>

          {/* بخش خبرنامه */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" }, // در RTL می‌شود flex-start
              minWidth: { xs: "100%", sm: "320px", md: "300px" },
              mt: { xs: 4, md: 0 }, // اضافه کردن فاصله در موبایل
            }}
          >
            <Typography
              variant='body2'
              sx={{ color: "text.primary", fontWeight: 500, mb: 1 }}
            >
              عضویت در خبرنامه
            </Typography>
            <Typography variant='body2' sx={{ color: "text.secondary", mb: 2 }}>
              از آخرین فیلم‌ها و تخفیف‌های ویژه مطلع شوید
            </Typography>
            {/* استفاده از TextField برای خبرنامه */}
            <TextField
              type='email'
              placeholder='ایمیل خود را وارد کنید'
              variant='filled' // یا "outlined" یا "standard" بر اساس طراحی
              size='small'
              sx={{
                width: "100%",
                mb: 2,
                "& .MuiFilledInput-root": {
                  // استایل برای variant="filled"
                  backgroundColor: alpha(theme.palette.background.paper, 0.8), // یا alpha(theme.palette.common.white, 0.05)
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.background.paper, 0.9), // یا alpha(theme.palette.common.white, 0.1)
                  },
                  "&.Mui-focused": {
                    backgroundColor: alpha(
                      theme.palette.background.paper,
                      0.95
                    ),
                  },
                },
                "& .MuiInputBase-input": {
                  color: "text.primary", // رنگ متن ورودی
                },
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Button
                        variant='contained'
                        color='primary' // استفاده از رنگ اصلی تم
                        size='small'
                        sx={{
                          height: "100%",
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                        }} // چسبیدن به TextField
                        aria-label='عضویت در خبرنامه'
                      >
                        <ArrowCircleLeftOutlined fontSize='small' />
                        {/* یا متن "عضویت" */}
                      </Button>
                    </InputAdornment>
                  ),
                  disableUnderline: true, // For variant="filled"
                },
              }}
            />
          </Box>
        </Box>
        {/* بخش لینک‌های ستونی */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: theme.spacing(4), // استفاده از theme.spacing
            mb: 6,
          }}
        >
          {footerGroups.map((group, index) => (
            <Box key={index}>
              <FooterTitle>{group.title}</FooterTitle>
              <Box>
                {group.links.map((link, linkIndex) => (
                  <StyledLink key={linkIndex} href='#'>
                    {link}
                  </StyledLink>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
        {/* خط جداکننده و بخش پایانی */}
        <Divider sx={{ borderColor: "divider", mb: 3 }} />{" "}
        {/* استفاده از divider تم */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant='body2'
            color='text.disabled'
            sx={{ mb: { xs: 2, sm: 0 } }}
          >
            {" "}
            {/* استفاده از رنگ متن غیرفعال تم */}© {new Date().getFullYear()}{" "}
            پارس‌فلیکس. تمامی حقوق محفوظ است.
          </Typography>

          {/* دکمه تغییر زبان */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button
              startIcon={<Language />}
              variant='outlined'
              size='small'
              sx={{
                // استفاده از رنگ و بوردر تم
                color: "text.secondary",
                borderColor: "divider",
                "&:hover": {
                  borderColor: alpha(theme.palette.divider, 0.7),
                  backgroundColor: alpha(theme.palette.background.paper, 0.3),
                },
              }}
            >
              فارسی
            </Button>
          </Box>
        </Box>
      </Container>

      {/* دکمه اسکرول به بالا */}
      <ScrollTopButton onClick={handleScrollTop} aria-label='برو به بالا'>
        <KeyboardArrowUpIcon />
      </ScrollTopButton>
    </FooterContainer>
  );
};

export default Footer;
