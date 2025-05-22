// src/app/layout.tsx
import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google'; // ایمپورت فونت وزیرمتن از next/font
import './globals.css';
import Providers from '@/components/providers/Providers';

// پیکربندی فونت وزیرمتن
const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'], // شامل حروف فارسی ('arabic') و لاتین
  display: 'swap', // فونت جایگزین تا زمان لود شدن نمایش داده شود
  // می‌توانید وزن‌های مورد نیاز را مشخص کنید:
  // weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});

// می‌توانید Metadata را هم به‌روز کنید
export const metadata: Metadata = {
  title: 'Parsflix | پارسفلیکس',
  description: 'جدیدترین فیلم‌ها و سریال‌ها را در پارسفلیکس تماشا کنید',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // تنظیم زبان به فارسی و جهت به راست‌چین برای کل سند HTML
    <html
      lang='fa'
      dir='rtl'
    >
      <body className={vazirmatn.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
