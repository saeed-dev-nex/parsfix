import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiPost, apiPut, apiPutFormData } from './../../lib/apiHelper';
import { RootState } from '../store';
import { apiGet } from '@/lib/apiHelper';
import { Gender, User } from '@/types';
import { updateUserProfile, uploadProfilePicture } from './profileSlice';
/**
 * Redux slice for managing authentication state
 *
 * @module authSlice
 *
 * @typedef {Object} User - User data interface
 * @property {string} id - Unique identifier for the user
 * @property {string} name - User's name
 * @property {string} email - User's email address
 * @property {('USER'|'ADMIN'|'SUPER_ADMIN')} role - User's role in the system
 *
 * @typedef {Object} AuthState - Authentication state interface
 * @property {User|null} user - Currently authenticated user or null if not logged in
 * @property {boolean} isLoading - Loading state indicator
 * @property {string|null} error - Error message if authentication fails
 *
 * @constant {AuthState} initialState - Initial authentication state
 */

interface ActivationCredentials {
  email: string;
  code: string;
}

/**
 * initial type of auth state
 */
export interface AuthError {
  message: string;
  code?: string; // کدهای اختصاصی مثل ACTIVATION_PENDING, ACTIVATION_RESENT
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: AuthError | null; // تغییر تایپ خطا
  activationMessage: string | null; // برای نمایش پیام موفقیت فعال‌سازی
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
  activationMessage: null,
};

/* ------ Async Thunks for authentication to server API ------ */

// 1. بررسی وضعیت احراز هویت در بارگذاری اولیه

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call to check auth status
      // 1. call api
      const responseData = await apiGet('/auth/me');
      // 2. check if responseData is Success or not
      if (responseData?.status === 'success' && responseData?.data?.user) {
        return responseData.data.user as User;
      } else {
        throw new Error('ساختار پاسخ دریافتی از API معتبر نمی باشد');
      }
    } catch (error: any) {
      console.error('Error checking auth status:', error.message);
      return rejectWithValue({
        message: error.message || 'خطا در دریافت اطلاعات کاربر',
      } as AuthError);
    }
  }
);

// 2. ورود به سیستم
interface LoginCredentials {
  email: string;
  password: string;
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      console.log('Logging in user...', credentials);
      // TODO: Replace with actual API call to log in user
      // 1. call api
      const responseData = await apiPost('/auth/login', credentials);
      // 2. check server back response is success or not
      if (responseData?.status === 'success' || responseData?.data?.user) {
        return responseData.data.user;
      } else {
        throw new Error('ساختار پاسخ دریافتی از API معتبر نمی باشد');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorCode = error.data?.code || error.code;
      const errorMessage = error.message || 'خطا در ورود به سیستم';
      if (
        errorCode === 'ACTIVATION_PENDING' ||
        errorCode === 'ACTIVATION_RESENT'
      ) {
        return rejectWithValue({
          message: errorMessage,
          code: errorCode,
        });
      }
      return rejectWithValue({ message: error.message } as AuthError);
    }
  }
);

// 3. ثبت نام کاربر
export const signupUser = createAsyncThunk<
  User,
  { email: string; password: string; name?: string }
>('auth/signupUser', async (userData, { rejectWithValue }) => {
  try {
    console.log('Signing up user...', userData);
    const responseData = await apiPost('/auth/signup', userData);
    if (responseData?.status === 'success' && responseData?.data?.user) {
      // server set cookie we just return user data
      return responseData.data.user;
    } else {
      throw new Error('ساختار پاسخ دریافتی از API معتبر نمی باشد');
    }
  } catch (error: any) {
    console.error('Signup failed:', error);
    return rejectWithValue({
      message: error.message || 'خطا در ثبت نام',
    } as AuthError);
  }
});

// 4. خروج از سیستم
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Logging out user...');

      const responseData = await apiPost('/auth/logout', {});
      console.log('Logout successful (simulated)');
      return true;
    } catch (error: any) {
      console.error('Logout failed:', error);
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// 5. فعالسازی حساب کاربری
export const activationUserAccount = createAsyncThunk<
  string,
  ActivationCredentials
>('auth/activationUserAccount', async (credentials, { rejectWithValue }) => {
  try {
    console.log('Activating user account...', credentials);
    const responseData = await apiPost('/auth/activate', credentials);
    if (responseData?.status === 'success' || responseData?.data?.user) {
      return responseData.message;
    } else {
      throw new Error('ساختار پاسخ دریافتی از API معتبر نمی باشد');
    }
  } catch (error: any) {
    console.error('activation failed:', error);
    return rejectWithValue({
      message: error.message || 'خطلا در ثبت نام',
    } as AuthError);
  }
});
// 6. ورود با گوگل
export const signInWithGoogle = createAsyncThunk<User, string>(
  'auth/signInWithGoogle',
  async (idToken, { rejectWithValue }) => {
    try {
      console.log('Signing in with Google...', idToken);
      const responseData = await apiPost('/auth/google', { idToken });
      console.log("🔍 ~ createAsyncThunk('auth/signInWithGoogle') callback ~ client/src/store/slices/authSlice.ts:182 ~ responseData:", responseData)
      
      if (responseData?.status === 'success' && responseData?.data?.user) {
        return responseData.data.user as User;
      } else {
        throw new Error('ساختار پاسخ دریافتی از API معتبر نمی باشد');
      }
    } catch (error: any) {
      console.error('signInWithGoogle failed:', error);
      return rejectWithValue({
        message: error.message || 'خطلا در ورود با گوگل',
      } as AuthError);
    }
  }
);
// 7. ارسال مجدد کد فعالسازی
export const resendActivationCode = createAsyncThunk<string, string>(
  'auth/resendActivationCode',
  async (email: string, { rejectWithValue }) => {
    try {
      const responseData = await apiPost('/auth/resent-activation-code', {
        email,
      });
      if (responseData?.status === 'success' && responseData?.data?.message) {
        return responseData.data.message;
      } else {
        throw new Error(responseData?.message || 'خطا در ساختار پاسخ سرور');
      }
    } catch (error: any) {
      console.error('Resend activation code failed:', error);
      return rejectWithValue({
        message: error.message || 'خطا در ارسال کد فعالسازی جدید',
      } as AuthError);
    }
  }
);

// --------- Slice Definition ----------
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearActivationMessage: (state) => {
      state.activationMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activationMessage = null;
      })

      .addCase(
        checkAuthStatus.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.user = action.payload;
          state.isLoading = false;
        }
      )
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.user = null;
        state.isLoading = false;
        state.error = action.payload as AuthError;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activationMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as AuthError;
      })
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activationMessage = null;
      })
      .addCase(signupUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isLoading = false;
        state.activationMessage = 'ایمیل فعالسازی ارسال شد';
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.user = null;
        state.isLoading = false;
        state.error = action.payload as AuthError;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as AuthError;
        state.user = null;
      })
      .addCase(activationUserAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activationMessage = null;
      })
      .addCase(
        activationUserAccount.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.error = null;
          state.activationMessage = action.payload; // ذخیره پیام موفقیت فعال‌سازی
          // state.user اینجا آپدیت نمی‌شود، کاربر باید لاگین کند
        }
      )
      .addCase(activationUserAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as AuthError; // نمایش خطای فعال‌سازی
        state.activationMessage = null;
      })
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activationMessage = null;
      })
      .addCase(
        signInWithGoogle.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.user = action.payload; // تنظیم کاربر پس از ورود موفق با گوگل
          state.isLoading = false;
          state.error = null;
        }
      )
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.user = null; // ورود ناموفق
        state.isLoading = false;
        state.error = action.payload as AuthError;
      })
      .addCase(resendActivationCode.pending, (state) => {
        state.isLoading = true; // یا یک state لودینگ جدا برای resend
        state.error = null;
        // state.activationMessage = "در حال ارسال کد جدید..."; // پیام موقت؟
      })
      .addCase(
        resendActivationCode.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.error = null;
          state.activationMessage = action.payload; // نمایش پیام موفقیت از سرور
        }
      )
      .addCase(resendActivationCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as AuthError;
      })

      .addCase(
        updateUserProfile.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.isLoading = false;
          // --- مهم: آپدیت اطلاعات کاربر در state ---
          state.user = { ...state.user, ...action.payload };
          state.error = null;
          // می‌توانید یک پیام موفقیت موقت هم ست کنید اگر state مربوطه را دارید
          // state.successMessage = "پروفایل با موفقیت آپدیت شد.";
        }
      )
      .addCase(
        uploadProfilePicture.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.isLoading = false;
          if (state.user) {
            // فقط اگر کاربری در state وجود دارد
            // فقط URL عکس را آپدیت می‌کنیم یا کل آبجکت را؟ بهتر است کل آبجکت دریافتی جایگزین شود
            // تا سایر اطلاعات هم سینک بمانند (اگرچه در این مورد فقط عکس آپدیت شده)
            state.user = { ...state.user, ...action.payload };
            // یا فقط عکس: state.user.profilePictureUrl = action.payload.profilePictureUrl;
          }
          state.error = null;
        }
      );
  },
});

export const { clearAuthError, clearActivationMessage } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: RootState): User | null =>
  state.auth.user;
export const selectIsLoggedIn = (state: RootState): boolean =>
  !!state.auth.user;
export const selectAuthError = (state: RootState): AuthError | null =>
  state.auth.error || null;
export const selectAuthIsLoading = (state: RootState): boolean =>
  state.auth.isLoading;
export const selectActivationMessage = (state: RootState): string | null =>
  state.auth.activationMessage;
