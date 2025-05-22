"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  Visibility,
  VisibilityOff,
  Google,
  PersonOutline,
  LockOutlined,
  MailOutline,
  CheckCircleOutline,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";

import {
  signupUser,
  selectAuthIsLoading,
  selectAuthError,
  selectActivationMessage, // سلکتور جدید
  clearAuthError,
  clearActivationMessage,
  signInWithGoogle, // اکشن‌های جدید
} from "../../../store/slices/authSlice";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";

// --- کامپوننت های استایل شده ---
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

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(51, 51, 51, 0.8)",
    backdropFilter: "blur(10px)",
    borderRadius: "4px",
    height: "60px",
    transition: "all 0.3s ease",
    color: "#fff",
    "&:hover": {
      backgroundColor: "rgba(69, 69, 69, 0.8)",
    },
    "&.Mui-focused": {
      backgroundColor: "rgba(69, 69, 69, 0.9)",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#e50914",
        borderWidth: "2px",
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(128, 128, 128, 0.7)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.7)",
    "&.Mui-focused": {
      color: "#e50914",
    },
  },
  "& .MuiInputAdornment-root": {
    color: "rgba(255, 255, 255, 0.7)",
  },
  marginBottom: "1.5rem",
}));

const SignupButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#e50914",
  color: "#fff",
  height: "60px",
  borderRadius: "4px",
  fontSize: "1.1rem",
  fontWeight: "bold",
  textTransform: "none",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "#f40612",
    transform: "translateY(-3px)",
    boxShadow: "0 6px 20px rgba(229, 9, 20, 0.4)",
  },
  "&:active": {
    transform: "translateY(-1px)",
    boxShadow: "0 3px 10px rgba(229, 9, 20, 0.4)",
  },
  "&.Mui-disabled": {
    backgroundColor: "rgba(229, 9, 20, 0.5)",
    color: "rgba(255, 255, 255, 0.8)",
  },
}));

const GoogleButton = styled(Button)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  color: "#fff",
  height: "60px",
  borderRadius: "4px",
  fontSize: "1.1rem",
  fontWeight: "500",
  textTransform: "none",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    transform: "translateY(-3px)",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
  },
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  "&::before, &::after": {
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  color: "rgba(255, 255, 255, 0.6)",
  margin: "2rem 0",
}));

const FormLink = styled(Link)(({ theme }) => ({
  color: "#fff",
  textDecoration: "none",
  position: "relative",
  transition: "all 0.3s ease",
  "&::after": {
    content: '""',
    position: "absolute",
    width: "0",
    height: "1px",
    bottom: "-2px",
    left: "0",
    backgroundColor: "#e50914",
    transition: "width 0.3s ease",
  },
  "&:hover": {
    color: "#e50914",
    "&::after": {
      width: "100%",
    },
  },
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: "8px",
  "& svg": {
    color: "#e50914",
    marginLeft: "8px",
  },
  "& p": {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "0.9rem",
  },
}));

export default function SignupPage() {
  // Hooks
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch<AppDispatch>();

  // ---Selectors ---
  const isLoading = useSelector(selectAuthIsLoading);
  const error = useSelector(selectAuthError); // حالا یک آبجکت { message, code? } است
  const activationMessage = useSelector(selectActivationMessage); // دریافت پیام فعال سازی
  const isCheckingAuth = useRedirectIfAuthenticated("/");
  // Local States
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Clear Errors When Component is Unmount
  useEffect(() => {
    dispatch(clearAuthError());
    dispatch(clearActivationMessage());
  }, [dispatch]);
  // --- Effect برای ریدایرکت پس از ثبت‌نام موفق ---
  useEffect(() => {
    console.log("signup page ----------------->", activationMessage);

    if (activationMessage && !error) {
      router.push(
        `/activation-sent?email=${encodeURIComponent(formData.email)}`
      );
    }
    // نیازی به پاک کردن activationMessage در اینجا نیست چون در unmount پاک می‌شود
  }, [activationMessage, error, router, formData]); // formData.email را به وابستگی‌ها اضافه می‌کنیم

  // Events Handlers
  const handleTogglePassword = () => setShowPassword((prev) => !prev);
  const handleToggleConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // پاک کردن خطای فیلد در صورت تغییر
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors = { name: "", email: "", password: "", confirmPassword: "" };

    // بررسی نام
    if (!formData.name) {
      errors.name = "لطفاً نام خود را وارد کنید";
      isValid = false;
    }

    // بررسی ایمیل
    if (!formData.email) {
      errors.email = "لطفاً ایمیل خود را وارد کنید";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "لطفاً یک ایمیل معتبر وارد کنید";
      isValid = false;
    }

    // بررسی رمز عبور
    if (!formData.password) {
      errors.password = "لطفاً رمز عبور خود را وارد کنید";
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = "رمز عبور باید حداقل 8 کاراکتر باشد";
      isValid = false;
    }

    // بررسی تکرار رمز عبور
    if (!formData.confirmPassword) {
      errors.confirmPassword = "لطفاً تکرار رمز عبور را وارد کنید";
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = "تکرار رمز عبور با رمز عبور مطابقت ندارد";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };
  // ------------------------- Google Sign-In -------------------------
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      console.log("Google ID Token:", idToken ? "Received" : "Not Received");
      if (idToken) {
        const actionResult = await dispatch(signInWithGoogle(idToken));
        if (signInWithGoogle.fulfilled.match(actionResult)) {
          router.push("/");
        } else {
          throw new Error("Failed to get ID token from Google Sign-In.");
        }
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      // می‌توانید خطا را به صورت لوکال نمایش دهید یا یک اکشن Redux برای ثبت خطا dispatch کنید
      // dispatch(setError(error.message || "خطا در ورود با گوگل"));
    }
  };
  // ------------------------------------------------------------------
  // ------------------------- Submit Handler -------------------------

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    dispatch(clearActivationMessage());
    if (!validateForm()) return;
    const { name, email, password } = formData;
    dispatch(signupUser({ name, email: email.trim().toLowerCase(), password }));
  };
  // ------------------------- End Submit Handler -------------------------

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundImage: `
          linear-gradient(
            to top,
            rgba(0, 0, 0, 0.9) 0%,
            rgba(0, 0, 0, 0.6) 60%,
            rgba(0, 0, 0, 0.9) 100%
          ),
          url("/images/hero.jpg")
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: { xs: "20px 0", md: "40px 0" },
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(
              circle at 20% 20%, 
              rgba(229, 9, 20, 0.05) 0%, 
              transparent 70%
            )
          `,
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth='sm'>
        <Paper
          elevation={24}
          sx={{
            p: { xs: 4, sm: 5 },
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(10px)",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "3px",
              background: "linear-gradient(90deg, #e50914, #ff5f6d)",
            },
            animation: "fadeIn 0.5s ease",
            "@keyframes fadeIn": {
              "0%": { opacity: 0, transform: "translateY(10px)" },
              "100%": { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {/* لوگو */}
          <Link href='/' style={{ textDecoration: "none" }}>
            <Logo variant={isMobile ? "h5" : "h4"}>PARSFLIX</Logo>
          </Link>

          {/* عنوان فرم */}
          <Typography
            variant={isMobile ? "h5" : "h4"}
            component='h4'
            sx={{
              fontWeight: "bold",
              mb: 4,
              textAlign: "center",
              color: "#fff",
            }}
          >
            ثبت‌نام در پارس‌فلیکس
          </Typography>

          {/* نمایش خطا */}
          {error && (
            <Alert
              severity='error'
              sx={{
                mb: 3,
                backgroundColor: "rgba(211, 47, 47, 0.2)",
                color: "#ff5252",
                border: "1px solid rgba(211, 47, 47, 0.3)",
                borderRadius: "4px",
                animation: "fadeIn 0.5s ease-in-out",
                "@keyframes fadeIn": {
                  "0%": { opacity: 0, transform: "translateY(-10px)" },
                  "100%": { opacity: 1, transform: "translateY(0)" },
                },
              }}
            >
              {error.message}
            </Alert>
          )}
          {/* --- نمایش پیام فعال‌سازی Redux --- */}
          {activationMessage && (
            <Alert
              severity='success' // یا 'info' بسته به پیام
              sx={{ mb: 3 /* ... other styles */ }}
              onClose={() => dispatch(clearActivationMessage())} // دکمه بستن برای پاک کردن پیام
            >
              {activationMessage}
            </Alert>
          )}

          {/* فرم ثبت‌نام */}
          <Box component='form' onSubmit={handleSubmit} noValidate>
            {/* فیلد نام */}
            <StyledTextField
              required
              fullWidth
              id='name'
              label='نام و نام خانوادگی'
              name='name'
              autoComplete='name'
              autoFocus
              value={formData.name}
              onChange={handleChange}
              error={!!validationErrors.name}
              helperText={validationErrors.name}
              FormHelperTextProps={{
                sx: {
                  color: "rgba(255, 82, 82, 0.8)",
                  fontSize: "0.8rem",
                  marginRight: "14px",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <PersonOutline sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* فیلد ایمیل */}
            <StyledTextField
              required
              fullWidth
              id='email'
              label='ایمیل'
              name='email'
              autoComplete='email'
              value={formData.email}
              onChange={handleChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              FormHelperTextProps={{
                sx: {
                  color: "rgba(255, 82, 82, 0.8)",
                  fontSize: "0.8rem",
                  marginRight: "14px",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <MailOutline sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* فیلد رمز عبور */}
            <StyledTextField
              required
              fullWidth
              name='password'
              label='رمز عبور'
              type={showPassword ? "text" : "password"}
              id='password'
              autoComplete='new-password'
              value={formData.password}
              onChange={handleChange}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              FormHelperTextProps={{
                sx: {
                  color: "rgba(255, 82, 82, 0.8)",
                  fontSize: "0.8rem",
                  marginRight: "14px",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <LockOutlined sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      aria-label='toggle password visibility'
                      onClick={handleTogglePassword}
                      edge='end'
                      sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* فیلد تکرار رمز عبور */}
            <StyledTextField
              required
              fullWidth
              name='confirmPassword'
              label='تکرار رمز عبور'
              type={showConfirmPassword ? "text" : "password"}
              id='confirmPassword'
              autoComplete='new-password'
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              FormHelperTextProps={{
                sx: {
                  color: "rgba(255, 82, 82, 0.8)",
                  fontSize: "0.8rem",
                  marginRight: "14px",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <LockOutlined sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      aria-label='toggle password visibility'
                      onClick={handleToggleConfirmPassword}
                      edge='end'
                      sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* ویژگی‌های سرویس */}
            <Box sx={{ my: 3, px: 1 }}>
              <Typography
                variant='body2'
                sx={{ color: "rgba(255, 255, 255, 0.8)", mb: 2 }}
              >
                با ثبت‌نام، شما از این مزایا بهره‌مند می‌شوید:
              </Typography>

              <FeatureItem>
                <CheckCircleOutline fontSize='small' />
                <Typography variant='body2'>
                  تماشای نامحدود فیلم‌ها و سریال‌ها
                </Typography>
              </FeatureItem>

              <FeatureItem>
                <CheckCircleOutline fontSize='small' />
                <Typography variant='body2'>
                  امکان دانلود برای تماشای آفلاین
                </Typography>
              </FeatureItem>

              <FeatureItem>
                <CheckCircleOutline fontSize='small' />
                <Typography variant='body2'>
                  کیفیت HD و 4K در تمامی دستگاه‌ها
                </Typography>
              </FeatureItem>

              <FeatureItem>
                <CheckCircleOutline fontSize='small' />
                <Typography variant='body2'>لغو اشتراک در هر زمان</Typography>
              </FeatureItem>
            </Box>

            {/* دکمه ثبت‌نام */}
            <SignupButton
              type='submit'
              fullWidth
              variant='contained'
              disabled={isLoading}
              sx={{ mb: 3 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color='inherit' />
              ) : (
                "ثبت‌نام و شروع اشتراک"
              )}
            </SignupButton>

            <StyledDivider>یا</StyledDivider>

            {/* دکمه ثبت‌نام با گوگل */}
            <GoogleButton
              fullWidth
              variant='outlined'
              startIcon={<Google />}
              onClick={handleGoogleSignIn}
              sx={{ mb: 3 }}
            >
              ثبت‌نام با حساب گوگل
            </GoogleButton>

            {/* لینک ورود */}
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography
                variant='body2'
                sx={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                قبلاً ثبت‌نام کرده‌اید؟{" "}
                <FormLink href='/login'>
                  <Typography
                    component='span'
                    sx={{
                      fontWeight: "bold",
                      color: "#fff",
                      "&:hover": { color: "#e50914" },
                    }}
                  >
                    وارد شوید
                  </Typography>
                </FormLink>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
