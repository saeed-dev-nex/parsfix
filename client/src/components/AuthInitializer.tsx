'use client';

import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { checkAuthStatus } from '@/store/slices/authSlice';

// This component is used to check the auth status of the user
// It is used to prevent the user from being logged out when the page is refreshed
// It is also used to check the auth status of the user when the page is loaded
export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();
  // This is used to prevent the effect from running on every render
  const effectRan = useRef(false);
  useEffect(() => {
    // In development mode, the effect will run two times on every render in react 18+
    // this condition block the effect from running on every render
    if (process.env.NODE_ENV === 'production' || !effectRan.current) {
      console.log('AuthInitializer: Dispatching checkAuthStatus');
      dispatch(checkAuthStatus());
    }
    // Record that the effect has been executed least once
    return () => {
      effectRan.current = true;
    };
  }, [dispatch]);
  return <>{children}</>;
}
