"use client";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { CacheProvider } from "@emotion/react";
import { store } from "@/store/store";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { checkAuthStatus } from "@/store/slices/authSlice"; // Import the thunk action
import ThemeRegistry from "../ThemeRegestry/ThemeRegestry";
import AuthInitializer from "../AuthInitializer";
import RootLayoutClientWrapper from "../RootLayoutClientWrapper";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFnsJalali } from "@mui/x-date-pickers/AdapterDateFnsJalali";
import { faIR } from "date-fns/locale/fa-IR";
import { prefixer } from "stylis";

export default function Providers({ children }: { children: React.ReactNode }) {
  const cacheRtl = createCache({
    key: "adapter-date-fns-jalali-demo",
    stylisPlugins: [prefixer, rtlPlugin],
  });
  // اجرای اولیه برای بررسی وضعیت کاربر هنگام بارگذاری برنامه
  useEffect(() => {
    // @ts-ignore // ممکن است dispatch نیاز به تایپ AppDispatch داشته باشد
    store.dispatch(checkAuthStatus());
  }, []);

  return (
    <CacheProvider value={cacheRtl}>
      <LocalizationProvider
        dateAdapter={AdapterDateFnsJalali}
        // adapterLocale={faIR} // تنظیم زبان فارسی
      >
        <Provider store={store}>
          <AuthInitializer>
            <ThemeRegistry>
              {/* @ts-ignore */}
              <RootLayoutClientWrapper>{children}</RootLayoutClientWrapper>
            </ThemeRegistry>
          </AuthInitializer>
        </Provider>
      </LocalizationProvider>
    </CacheProvider>
  );
}
