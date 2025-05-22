// client/src/components/RootLayoutClientWrapper.tsx
'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { selectAuthIsLoading } from '@/store/slices/authSlice'; // ایمپورت سلکتور
import GlobalLoadingIndicator from './common/GlobalLoadingIndicator'; // ایمپورت نشانگر

export default function RootLayoutClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // خواندن وضعیت isLoading از Redux state
  const isLoading = useSelector(selectAuthIsLoading);

  return (
    <>
      {/* رندر فرزندان (محتوای اصلی برنامه) */}
      {children}
      {/* نمایش نشانگر بارگذاری به صورت شرطی */}
      <GlobalLoadingIndicator open={isLoading} />
    </>
  );
}
