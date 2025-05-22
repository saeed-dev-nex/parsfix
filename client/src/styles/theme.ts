// src/styles/theme.ts
import { createTheme } from "@mui/material/styles";
import { faIR } from "@mui/material/locale"; // Import Persian locale

// نیازی به import فونت در اینجا نیست، چون از next/font استفاده می‌کنیم
// اما نام آن را در fontFamily تعریف می‌کنیم

const theme = createTheme(
  {
    direction: "rtl", // تنظیم جهت کلی به راست‌چین
    typography: {
      // فونت پیش‌فرض برنامه را وزیرمتن قرار می‌دهیم
      // فونت‌های بعدی به عنوان fallback عمل می‌کنند اگر وزیرمتن لود نشود
      fontFamily: '"Vazirmatn", Roboto, "Helvetica Neue", Arial, sans-serif',
      // می‌توانید سایر تنظیمات تایپوگرافی (مثل سایزها، وزن‌ها) را اینجا سفارشی کنید
      // h1: { ... },
      // body1: { ... },
    },
    palette: {
      // در آینده می‌توانید پالت رنگی مشابه Netflix را اینجا تعریف کنید
      mode: "dark", // مثلا تم دارک به صورت پیش‌فرض
      primary: { main: "#E50914" }, // رنگ قرمز Netflix
      background: {
        default: "#070606",
        paper: "#1f1f1f",
      },
    },
    shape: {
      borderRadius: 2,
    },
    components: {
      // اینجا می‌توانید استایل پیش‌فرض کامپوننت‌های MUI را تغییر دهید
      // MuiButton: { styleOverrides: { root: { borderRadius: 0 } } },
    },
  },
  faIR // اضافه کردن localization فارسی برای کامپوننت‌هایی مثل DatePicker
);
export default theme;
