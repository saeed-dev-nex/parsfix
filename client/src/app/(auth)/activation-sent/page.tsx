// client/src/app/(public)/auth/activation-sent/page.tsx
"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation"; // useSearchParams برای خواندن پارامترها
import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Icon,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material"; // Added useTheme, useMediaQuery
import { styled } from "@mui/material/styles";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import { selectAuthIsLoading } from "@/store/slices/authSlice";
import { useSelector } from "react-redux";

// --- استایل‌ها ---

const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  fontSize: "2.5rem",
  letterSpacing: "-1px",
  background: `linear-gradient(90deg, #e50914, #ff5f6d)`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  marginBottom: "2rem",
  width: "100%",
  textAlign: "center",
  textShadow: "0 2px 10px rgba(229, 9, 20, 0.3)",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4, 5),
  backgroundColor: "rgba(0, 0, 0, 0.8)", // Consistent with activate-account
  backdropFilter: "blur(12px)", // Consistent with activate-account
  borderRadius: "12px", // Consistent with activate-account
  border: "1px solid rgba(255, 255, 255, 0.1)", // Consistent with activate-account
  color: "#fff",
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 8px 32px 0 rgba( 31, 38, 135, 0.37 )", // Added subtle shadow
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",

    height: "4px", // Consistent with activate-account
    background: "linear-gradient(90deg, #e50914, #ff5f6d)",
  },

  animation: "fadeIn 0.6s ease-out", // Consistent with activate-account
  "@keyframes fadeIn": {
    "0%": { opacity: 0, transform: "translateY(20px)" },
    "100%": { opacity: 1, transform: "translateY(0)" },
  },
}));

const ActivateButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#e50914",
  color: "#fff",

  height: "55px", // Consistent height
  marginTop: theme.spacing(3),
  borderRadius: "8px", // Consistent radius
  fontSize: "1.1rem",
  fontWeight: "bold",
  width: "100%", // Make button full width
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "#f40612",

    transform: "translateY(-2px)", // Consistent hover effect
    boxShadow: "0 4px 15px rgba(229, 9, 20, 0.4)", // Consistent shadow
  },
}));
// --- پایان استایل‌ها ---

export default function ActivationSentPage() {
  const isCheckingAuth = useRedirectIfAuthenticated("/");
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoading = useSelector(selectAuthIsLoading);
  const email = searchParams.get("email"); // خواندن ایمیل از query string (اختیاری)
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  if (isCheckingAuth || isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "#141414",
        }}
      >
        <CircularProgress color='primary' />
      </Box>
    );
  }
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `
           linear-gradient(
             to top,

            rgba(0, 0, 0, 0.95) 0%,
            rgba(0, 0, 0, 0.7) 60%,
            rgba(0, 0, 0, 0.95) 100% // Consistent gradient
           ),
           url("/images/hero.jpg") // اطمینان از وجود این تصویر در public/images
         `,
        backgroundSize: "cover",
        backgroundPosition: "center",

        padding: theme.spacing(3, 2), // Use theme spacing
      }}
    >
      <Container maxWidth='xs'>
        {" "}
        {/* Consistent max width */}
        <StyledPaper elevation={24}>
          <Icon sx={{ fontSize: 50, color: "#e50914", mb: 2 }}>
            {" "}
            {/* Adjusted icon size and margin */}
            <MarkEmailReadOutlinedIcon fontSize='inherit' />
          </Icon>

          <Typography
            variant='h5' // Slightly smaller heading
            component='h1'
            sx={{ fontWeight: "bold", mb: 1.5 }}
          >
            ایمیل فعال‌سازی ارسال شد!
          </Typography>

          <Typography
            variant='body1'
            sx={{ color: "rgba(255, 255, 255, 0.85)", mb: 1 }} // Slightly brighter text
          >
            یک ایمیل حاوی کد فعال‌سازی ۶ رقمی به آدرس
            {email ? (
              <Typography
                component='span'
                sx={{
                  color: "#fff",
                  fontWeight: "bold",
                  mx: 0.5,
                  display: "inline-block",
                }}
              >
                {email}
              </Typography>
            ) : (
              " شما "
            )}
            ارسال گردید.
          </Typography>
          <Typography
            variant='body2'
            sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 3 }} // Slightly brighter text, adjusted margin
          >
            لطفاً صندوق ورودی (و پوشه اسپم) خود را بررسی کنید. کد دریافتی تا ۱۵
            دقیقه معتبر است.
          </Typography>

          <ActivateButton
            variant='contained'
            // Pass email to activate-account page if available
            onClick={() =>
              router.push(
                `/activate-account${
                  email ? `?email=${encodeURIComponent(email)}` : ""
                }`
              )
            }
            endIcon={<ArrowForwardIcon />}
          >
            ورود کد فعال‌سازی
          </ActivateButton>

          {/* Optional: Link back to login or home */}
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography
              variant='body2'
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              مشکلی پیش آمد؟{" "}
              <Link
                href='/login'
                style={{
                  color: "#b3b3b3",
                  textDecoration: "none",
                  "&:hover": {
                    color: "#fff",
                    textDecoration: "underline",
                    textDecorationColor: "#e50914",
                  },
                }}
              >
                بازگشت به ورود
              </Link>
            </Typography>
          </Box>
        </StyledPaper>
      </Container>
    </Box>
  );
}
