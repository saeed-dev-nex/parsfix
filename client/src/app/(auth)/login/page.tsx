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
  Checkbox,
  FormControlLabel,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  Visibility,
  VisibilityOff,
  Google,
  LockOutlined,
  MailOutline,
  ArrowForward,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
// مسیرهای مربوط به store خودتان را حفظ کنید
import { AppDispatch, RootState } from "@/store/store";
import {
  clearAuthError,
  loginUser,
  selectAuthError,
  selectAuthIsLoading,
  selectIsLoggedIn,
  signInWithGoogle,
} from "@/store/slices/authSlice";
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

const LoginButton = styled(Button)(({ theme }) => ({
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

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  color: "rgba(255, 255, 255, 0.7)",
  "&.Mui-checked": {
    color: "#e50914",
  },
}));

export default function LoginPage() {
  // Dispatch for redux
  const dispatch = useDispatch<AppDispatch>();
  // hooks
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isCheckingAuth = useRedirectIfAuthenticated("/");
  // States
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
  });

  // selectors
  const isLoading = useSelector(selectAuthIsLoading);
  const error = useSelector(selectAuthError);
  // const isLoggedIn = useSelector(selectIsLoggedIn);
  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  // --- Effect برای ریدایرکت در صورت ورود موفق ---
  // useEffect(() => {
  //   if (isLoggedIn) {
  //      اگر کاربر با موفقیت وارد شد، به صفحه اصلی یا داشبورد هدایت شود
  //     router.push("/"); // یا هر مسیر دیگری که مد نظر دارید
  //   }
  // }, [isLoggedIn, router]);

  //  redirect to activation-sent page if user is not activated
  useEffect(() => {
    if (
      error &&
      (error.code === "ACTIVATION_PENDING" ||
        error.code === "ACTIVATION_RESENT")
    ) {
      console.log(
        `Redirecting to activate-account due to error code: ${error.code}`
      );
      router.push(
        `/activate-account?email=${encodeURIComponent(credentials.email)}`
      );
    }
  }, [error, router, credentials.email]); // email را هم به وابستگی‌ها اضافه می‌کنیم

  // Events Handlers
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors = { email: "", password: "" };

    if (!credentials.email) {
      errors.email = "لطفاً ایمیل یا شماره موبایل خود را وارد کنید";
      isValid = false;
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email) &&
      !/^(09|989)\d{9}$/.test(credentials.email)
    ) {
      errors.email = "لطفاً یک ایمیل یا شماره موبایل معتبر وارد کنید";
      isValid = false;
    }

    if (!credentials.password) {
      errors.password = "لطفاً رمز عبور خود را وارد کنید";
      isValid = false;
    } else if (credentials.password.length < 6) {
      errors.password = "رمز عبور باید حداقل ۶ کاراکتر باشد";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // ----------------------- Handle Submit ------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError()); // پاک کردن خطای قبلی
    const { email, password } = credentials;

    if (!validateForm()) return;

    // Dispatch کردن thunk ورود
    // نیازی به await یا try/catch نیست، effect ها واکنش نشان می‌دهند
    dispatch(loginUser({ email: email.trim().toLowerCase(), password }));
  };
  /*------------------------------------------------------------------*/

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
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
        backgroundImage: `
          linear-gradient(
            to top,
            rgba(0, 0, 0, 0.9) 0%,
            rgba(0, 0, 0, 0.6) 60%,
            rgba(0, 0, 0, 0.9) 100%
          ),
          url("/images/signin-bg.webp")
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
            component='h1'
            sx={{
              fontWeight: "bold",
              mb: 4,
              textAlign: "center",
              color: "#fff",
            }}
          >
            ورود به حساب کاربری
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
              {error?.message}
            </Alert>
          )}

          {/* فرم ورود */}
          <Box component='form' onSubmit={handleSubmit} noValidate>
            {/* فیلد ایمیل */}
            <StyledTextField
              required
              fullWidth
              id='email'
              label='ایمیل یا شماره موبایل'
              name='email'
              autoComplete='email'
              autoFocus
              value={credentials.email}
              onChange={handleChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              FormHelperTextProps={{
                sx: {
                  color: "rgba(255, 82, 82, 0.8)",
                  fontSize: "0.8rem",
                  marginRight: "14px",
                  textAlign: "left !important",
                  direction: "ltr",
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <MailOutline sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
                    </InputAdornment>
                  ),
                },
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
              autoComplete='current-password'
              value={credentials.password}
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
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <LockOutlined
                        sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        aria-label='toggle password visibility'
                        onClick={togglePasswordVisibility}
                        edge='end'
                        sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* گزینه مرا به خاطر بسپار و فراموشی رمز عبور */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                mb: 2,
              }}
            >
              <FormControlLabel
                control={
                  <StyledCheckbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                }
                label={
                  <Typography
                    variant='body2'
                    sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                  >
                    مرا به خاطر بسپار
                  </Typography>
                }
                sx={{ mr: 0 }}
              />

              <FormLink href='/forgot-password'>
                <Typography
                  variant='body2'
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    transition: "color 0.3s",
                    "&:hover": { color: "#e50914" },
                  }}
                >
                  رمز عبور را فراموش کرده‌اید؟
                </Typography>
              </FormLink>
            </Box>

            {/* دکمه ورود */}
            <LoginButton
              type='submit'
              fullWidth
              variant='contained'
              disabled={isLoading}
              sx={{ mb: 3 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color='inherit' />
              ) : (
                "ورود به حساب"
              )}
            </LoginButton>

            <StyledDivider>یا</StyledDivider>

            {/* دکمه ورود با گوگل */}
            <GoogleButton
              fullWidth
              variant='outlined'
              startIcon={<Google />}
              onClick={handleGoogleSignIn}
              sx={{ mb: 3 }}
            >
              ورود با حساب گوگل
            </GoogleButton>

            {/* لینک ثبت‌نام */}
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography
                variant='body2'
                sx={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                حساب کاربری ندارید؟{" "}
                <FormLink href='/signup'>
                  <Typography
                    component='span'
                    sx={{
                      fontWeight: "bold",
                      color: "#fff",
                      "&:hover": { color: "#e50914" },
                    }}
                  >
                    ثبت‌نام کنید
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
