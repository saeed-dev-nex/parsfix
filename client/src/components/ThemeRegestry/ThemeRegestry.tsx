// src/components/ThemeRegistry/ThemeRegistry.tsx
"use client"; // این کامپوننت باید در سمت کلاینت اجرا شود

import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import stylisPluginRtl from "stylis-plugin-rtl"; // پلاگین RTL
import theme from "@/styles/theme"; // تم سفارشی که ساختیم

// این پیاده‌سازی بر اساس مستندات رسمی MUI برای App Router + RTL است
export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ cache, flush }] = React.useState(() => {
    const cache = createCache({
      key: "muirtl", // یک کلید مشخص برای کش RTL
      stylisPlugins: [stylisPluginRtl], // فعال کردن پلاگین RTL
      prepend: true, // برای اولویت دادن به استایل‌های MUI
    });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  // این هوک استایل‌های سمت سرور را به درستی به HTML اضافه می‌کند
  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = "";
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline استایل‌های پایه و نرمال‌سازی را اعمال می‌کند */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
