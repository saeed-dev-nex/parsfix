"use client";

import {
  selectAuthIsLoading,
  selectIsLoggedIn,
} from "@/store/slices/authSlice";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Role, User } from "@/types";

interface UseAuthProtectionOptions {
  redirectTo?: string;
  allowedRoles?: Role[];
  fallbackRedirect?: string;
}

/**
 * Hooks for protection page in client
 * - If user do not login or login but not have permission, redirect to login page
 * - this Hook according to initial loading state
 *
 * @param options
 * @returns isLoading, isLoggedIn, currentUser
 */
export function useAuthProtection(options: UseAuthProtectionOptions = {}) {
  const {
    redirectTo = "/login",
    allowedRoles,
    fallbackRedirect = "/",
  } = options;
  const router = useRouter();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isLoading = useSelector(selectAuthIsLoading);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  useEffect(() => {
    if (isLoading) {
      console.log("useAuthProtection: Still loading auth state...");
      return;
    }

    if (!isLoggedIn) {
      console.log(
        "useAuthProtection: User not logged in. Redirecting to",
        redirectTo
      );
      router.replace(redirectTo);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0 && currentUser) {
      console.log(
        `useAuthProtection: Checking roles. Allowed: ${allowedRoles.join(
          ", "
        )}, User role: ${currentUser.role}`
      );
      if (!allowedRoles.includes(currentUser.role as unknown as Role)) {
        console.log(
          `useAuthProtection: User role ${currentUser.role} not allowed. Redirecting to`,
          fallbackRedirect
        );
        router.replace(fallbackRedirect);
      }
    }
  }, [
    isLoading,
    currentUser,
    router,
    redirectTo,
    allowedRoles,
    fallbackRedirect,
  ]);

  return { isLoading, isLoggedIn, currentUser };
}
