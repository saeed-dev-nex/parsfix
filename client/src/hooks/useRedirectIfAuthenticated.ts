import {
  selectAuthIsLoading,
  selectIsLoggedIn,
} from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";

import { useEffect } from "react";
import { useSelector } from "react-redux";

/**
 * this hook redirect user if user logged In
 * @param redirectTo
 */
export function useRedirectIfAuthenticated(redirectTo: string = "/") {
  const router = useRouter();
  const isLoading = useSelector(selectAuthIsLoading);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (isLoggedIn) {
      router.replace(redirectTo);
    }
  }, [isLoading, isLoggedIn, redirectTo, router]);
  return isLoading;
}
