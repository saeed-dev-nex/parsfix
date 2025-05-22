"use client";

import React, {
  useEffect,
  useState,
  useRef,
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Icon,
  useTheme,
  useMediaQuery,
  Stack, // Added Stack for OTP inputs
  InputBase, // Added InputBase for custom input
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { MailOutline, VpnKeyOutlined } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

// ایمپورت موارد لازم از authSlice
import {
  activationUserAccount,
  selectAuthIsLoading,
  selectAuthError,
  selectActivationMessage,
  clearAuthError,
  clearActivationMessage,
  // resendActivationCode, // Added resendActivationCode
} from "../../../store/slices/authSlice";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";

// --- استایل‌ها (استفاده مجدد یا اقتباس از صفحات دیگر) ---
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
  backgroundColor: "rgba(0, 0, 0, 0.8)", // Slightly darker background
  backdropFilter: "blur(12px)",
  borderRadius: "12px", // More rounded corners
  border: "1px solid rgba(255, 255, 255, 0.1)", // Softer border
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
    height: "4px", // Slightly thicker gradient line
    background: "linear-gradient(90deg, #e50914, #ff5f6d)",
  },
  animation: "fadeIn 0.6s ease-out", // Smoother animation
  "@keyframes fadeIn": {
    "0%": { opacity: 0, transform: "translateY(20px)" },
    "100%": { opacity: 1, transform: "translateY(0)" },
  },
}));

// Removed StyledTextField as we are using a custom OTP input

// --- OTP Input Styles ---
const OtpInputBox = styled(InputBase)(({ theme }) => ({
  width: "45px", // Adjust size as needed
  height: "55px",
  margin: theme.spacing(0, 0.5),
  backgroundColor: "rgba(51, 51, 51, 0.8)",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.5rem",
  fontWeight: "bold",
  color: "#fff",
  textAlign: "center",
  border: "1px solid rgba(128, 128, 128, 0.5)",
  transition: "border-color 0.3s ease, background-color 0.3s ease",
  "& input": {
    textAlign: "center",
    padding: 0, // Remove default padding
    width: "100%",
    height: "100%",
    border: "none",
    background: "none",
    color: "inherit",
    fontSize: "inherit",
    fontWeight: "inherit",
    outline: "none",
  },
  "&:hover": {
    backgroundColor: "rgba(69, 69, 69, 0.8)",
  },
  "&.Mui-focused": {
    borderColor: "#e50914",
    backgroundColor: "rgba(69, 69, 69, 0.9)",
    boxShadow: `0 0 0 2px rgba(229, 9, 20, 0.3)`,
  },
}));
// --- End OTP Input Styles ---

const ActivateButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#e50914",
  color: "#fff",
  height: "55px", // Adjusted height
  marginTop: theme.spacing(3), // Adjusted margin
  borderRadius: "8px", // More rounded
  fontSize: "1.1rem",
  fontWeight: "bold",
  transition: "all 0.3s ease",
  width: "100%", // Make button full width
  "&:hover": {
    backgroundColor: "#f40612",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 15px rgba(229, 9, 20, 0.4)",
  },
  "&.Mui-disabled": {
    backgroundColor: "rgba(229, 9, 20, 0.4)", // Softer disabled state
    color: "rgba(255, 255, 255, 0.7)",
    cursor: "not-allowed",
    boxShadow: "none",
    transform: "none",
  },
}));

const FormLink = styled(Link)(({ theme }) => ({
  color: "#b3b3b3", // Lighter grey
  textDecoration: "none",
  position: "relative",
  transition: "color 0.3s ease",
  fontSize: "0.9rem",
  "&:hover": {
    color: "#fff",
    textDecoration: "underline",
    textDecorationColor: "#e50914",
  },
}));

const ResendButton = styled(Button)(({ theme }) => ({
  color: "#e50914",
  textTransform: "none",
  fontWeight: "bold",
  padding: theme.spacing(0.5, 1),
  marginTop: theme.spacing(1),
  "&:hover": {
    backgroundColor: "rgba(229, 9, 20, 0.1)",
  },
  "&.Mui-disabled": {
    color: "rgba(255, 255, 255, 0.5)",
  },
}));

// --- پایان استایل‌ها ---

const OTP_LENGTH = 6;

export default function ActivateAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch<AppDispatch>();

  // State های Redux
  const isLoading = useSelector(selectAuthIsLoading);
  const isCheckingAuth = useRedirectIfAuthenticated("/");
  const error = useSelector(selectAuthError); // آبجکت { message, code? }
  const activationMessage = useSelector(selectActivationMessage); // پیام موفقیت/وضعیت

  // State های محلی فرم
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [localError, setLocalError] = useState<string | null>(null); // Single error message for OTP
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Set email from query params on initial load
  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery) {
      setEmail(decodeURIComponent(emailFromQuery));
    }
  }, [searchParams]);

  // پاک کردن پیام‌ها/خطاها هنگام خروج از صفحه
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
      dispatch(clearActivationMessage());
    };
  }, [dispatch]);

  // ریدایرکت به صفحه لاگین پس از نمایش پیام موفقیت
  useEffect(() => {
    if (activationMessage && !error) {
      const timer = setTimeout(() => {
        dispatch(clearActivationMessage());
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activationMessage, error, router, dispatch]);

  // Resend Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (resendDisabled && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendDisabled, resendTimer]);

  const startResendTimer = () => {
    setResendDisabled(true);
    setResendTimer(60); // 60 seconds timer
  };

  // --- OTP Input Handlers ---
  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // Allow only single digit or empty

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setLocalError(null); // Clear local error on input
    dispatch(clearAuthError()); // Clear server error on input

    // Move focus to the next input if a digit is entered
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Move focus to the previous input on backspace if the current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (pasteData.length === OTP_LENGTH) {
      const newOtp = pasteData.split("");
      setOtp(newOtp);
      inputRefs.current[OTP_LENGTH - 1]?.focus(); // Focus the last input after paste
      setLocalError(null);
      dispatch(clearAuthError());
    }
  };
  // --- End OTP Input Handlers ---

  // مدیریت ارسال فرم
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(clearAuthError()); // Clear previous errors
    setLocalError(null);

    const activationCode = otp.join("");

    if (!email) {
      setLocalError("لطفاً ایمیل خود را وارد کنید."); // Should ideally not happen if email is prefilled
      return;
    }

    if (activationCode.length !== OTP_LENGTH) {
      setLocalError(`کد فعال‌سازی باید ${OTP_LENGTH} رقمی باشد.`);
      return;
    }

    dispatch(activationUserAccount({ email, code: activationCode }));
  };

  // Handle Resend Code
  const handleResendCode = async () => {
    if (!email) {
      setLocalError("ایمیل برای ارسال مجدد کد لازم است.");
      return;
    }
    dispatch(clearAuthError());
    setLocalError(null);
    try {
      // Assuming resendActivationCode returns a promise that resolves on success
      // await dispatch(resendActivationCode(email)).unwrap();
      // Show success feedback (optional, maybe a temporary message)
      startResendTimer();
    } catch (err) {
      // Error is handled by the slice and displayed via selectAuthError
      console.error("Resend failed:", err);
    }
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
        alignItems: "center",
        backgroundImage: `
           linear-gradient(
             to top,
             rgba(0, 0, 0, 0.95) 0%,
             rgba(0, 0, 0, 0.7) 60%,
             rgba(0, 0, 0, 0.95) 100%
           ),
           url("/images/hero.jpg")
         `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: { xs: "20px 0", md: "40px 0" },
      }}
    >
      <Container maxWidth='xs'>
        {" "}
        {/* Reduced maxWidth for a tighter look */}
        <StyledPaper elevation={24}>
          <Icon sx={{ fontSize: 50, color: "#e50914", mb: 2 }}>
            <VpnKeyOutlined fontSize='inherit' />
          </Icon>
          <Typography
            variant='h5' // Slightly smaller heading
            component='h1'
            sx={{ fontWeight: "bold", mb: 1.5 }}
          >
            فعال‌سازی حساب کاربری
          </Typography>
          <Typography
            variant='body2'
            sx={{ color: "rgba(255, 255, 255, 0.8)", mb: 3 }}
          >
            کد {OTP_LENGTH} رقمی ارسال شده به ایمیل{" "}
            <Typography
              component='span'
              sx={{ color: "#fff", fontWeight: "bold" }}
            >
              {email || "شما"}
            </Typography>{" "}
            را وارد کنید.
          </Typography>

          <form onSubmit={handleSubmit} noValidate>
            {/* Display Success/Error Messages */}
            {activationMessage && !error && (
              <Alert
                severity='success'
                sx={{ mb: 2, ".MuiAlert-message": { textAlign: "right" } }}
              >
                {activationMessage}
              </Alert>
            )}
            {error?.message && (
              <Alert
                severity='error'
                sx={{ mb: 2, ".MuiAlert-message": { textAlign: "right" } }}
              >
                {error.message}
              </Alert>
            )}
            {localError && (
              <Alert
                severity='warning'
                sx={{ mb: 2, ".MuiAlert-message": { textAlign: "right" } }}
              >
                {localError}
              </Alert>
            )}

            {/* OTP Input Fields */}
            <Stack
              direction='row-reverse'
              spacing={isMobile ? 0.5 : 1} // Adjust spacing
              justifyContent='center'
              sx={{ mb: 3, direction: "ltr" }} // Ensure LTR direction for inputs
              onPaste={handlePaste} // Handle paste on the container
            >
              {otp.map((digit, index) => (
                <OtpInputBox
                  key={index}
                  value={digit}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleOtpChange(index, e.target.value)
                  }
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                    handleKeyDown(index, e)
                  }
                  inputRef={(el) => (inputRefs.current[index] = el)}
                  slotProps={{
                    input: {
                      maxLength: 1,
                      "aria-label": `Digit ${index + 1}`,
                    },
                  }}
                />
              ))}
            </Stack>

            <ActivateButton
              type='submit'
              variant='contained'
              disabled={isLoading || otp.join("").length !== OTP_LENGTH}
              fullWidth
            >
              {isLoading ? (
                <CircularProgress size={24} color='inherit' />
              ) : (
                "فعال‌سازی و ورود"
              )}
            </ActivateButton>

            {/* Resend Code Section */}
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography
                variant='body2'
                sx={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                کد را دریافت نکردید؟{" "}
                <ResendButton
                  onClick={handleResendCode}
                  disabled={resendDisabled || isLoading}
                >
                  {resendDisabled
                    ? `ارسال مجدد (${resendTimer} ثانیه)`
                    : "ارسال مجدد کد"}
                </ResendButton>
              </Typography>
            </Box>

            {/* Link to Login */}
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography
                variant='body2'
                sx={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                قبلاً فعال‌سازی کرده‌اید؟{" "}
                <FormLink href='/login'>وارد شوید</FormLink>
              </Typography>
            </Box>
          </form>
        </StyledPaper>
      </Container>
    </Box>
  );
}
