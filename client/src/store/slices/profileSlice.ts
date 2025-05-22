// client/src/store/slices/profileSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiPut, apiPutFormData } from '@/lib/apiHelper';
import {
  User,
  AuthError,
  UpdateMoviePayload,
  UpdateUserProfilePayload,
} from '@/types'; // تایپ‌های لازم
import { RootState } from '../store';

// --- State ---
interface ProfileState {
  isLoadingUpdate: boolean; // لودینگ آپدیت اطلاعات متنی
  isLoadingImageUpload: boolean; // لودینگ آپدیت عکس
  error: AuthError | null;
  successMessage: string | null;
}

const initialState: ProfileState = {
  isLoadingUpdate: false,
  isLoadingImageUpload: false,
  error: null,
  successMessage: null,
};

// --- Thunks ---

// Thunk آپدیت اطلاعات پروفایل (مثل نام، تاریخ تولد، جنسیت)
// خروجی آن User آپدیت شده است تا authSlice بتواند state.user را آپدیت کند
export const updateUserProfile = createAsyncThunk<
  User,
  UpdateUserProfilePayload['updateData']
>('profile/updateProfile', async (updateData, { rejectWithValue }) => {
  try {
    console.log('Updating profile with data:', updateData);
    // اندپوینت آپدیت پروفایل کاربر فعلی (متفاوت از فیلم)
    const responseData = await apiPut(`/users/profile`, updateData);

    if (responseData?.status === 'success' && responseData?.data?.user) {
      return responseData.data.user as User;
    } else {
      throw new Error(
        responseData?.message || 'خطا در ساختار پاسخ آپدیت پروفایل'
      );
    }
  } catch (error: any) {
    console.error('Update profile failed:', error);
    return rejectWithValue({
      message: error.message || 'خطا در به‌روزرسانی پروفایل',
    } as AuthError);
  }
});

// Thunk آپلود عکس پروفایل کاربر
// خروجی آن User آپدیت شده است
export const uploadProfilePicture = createAsyncThunk<User, File>( // ورودی فقط فایل است
  'profile/uploadPicture',
  async (file, { rejectWithValue }) => {
    const formData = new FormData();
    formData.append('profilePicture', file); // نام فیلد مطابق با سرور (باید تعریف شود)
    try {
      console.log('Uploading user profile picture...');
      // اندپوینت آپدیت عکس پروفایل کاربر فعلی (متفاوت از فیلم)
      const responseData = await apiPutFormData(
        `/users/profile/picture`,
        formData
      ); // فرض وجود این اندپوینت

      if (responseData?.status === 'success' && responseData?.data?.user) {
        return responseData.data.user as User;
      } else {
        throw new Error(
          responseData?.message || 'خطا در ساختار پاسخ آپلود عکس پروفایل'
        );
      }
    } catch (error: any) {
      console.error('Profile picture upload failed:', error);
      return rejectWithValue({
        message: error.message || 'خطا در آپلود عکس پروفایل',
      } as AuthError);
    }
  }
);

// --- Slice ---
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    clearProfileSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoadingUpdate = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoadingUpdate = false;
        state.successMessage = 'پروفایل با موفقیت به‌روزرسانی شد.';
      }) // فقط پیام موفقیت
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoadingUpdate = false;
        state.error = action.payload as AuthError;
      })

      // Upload Profile Picture
      .addCase(uploadProfilePicture.pending, (state) => {
        state.isLoadingImageUpload = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.isLoadingImageUpload = false;
        state.successMessage = 'عکس پروفایل با موفقیت آپلود شد.';
      }) // فقط پیام موفقیت
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.isLoadingImageUpload = false;
        state.error = action.payload as AuthError;
      });
  },
});

// --- Exports ---
export const { clearProfileError, clearProfileSuccessMessage } =
  profileSlice.actions;
export default profileSlice.reducer;

// --- Selectors ---
export const selectProfileIsLoadingUpdate = (state: RootState) =>
  state.profile.isLoadingUpdate;
export const selectProfileIsLoadingImageUpload = (state: RootState) =>
  state.profile.isLoadingImageUpload;
export const selectProfileError = (state: RootState) => state.profile.error;
export const selectProfileSuccessMessage = (state: RootState) =>
  state.profile.successMessage;
