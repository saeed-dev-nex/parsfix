import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiPut, apiPutFormData } from '@/lib/apiHelper';
import {
  Episode,
  AuthError,
  UpdateEpisodeData,
  UpdateEpisodeThunkPayload,
  UploadEpisodeStillThunkPayload,
} from '@/types'; // تایپ‌های لازم
import { RootState } from '../store';

// --- State ---
interface EpisodeState {
  isLoadingUpdate: boolean; // لودینگ آپدیت اطلاعات پایه
  isLoadingStillUpload: boolean; // لودینگ آپلود عکس صحنه
  error: AuthError | null;
  successMessage: string | null;
  // selectedEpisodeDetail: Episode | null; // اگر نیاز به نگهداری جزئیات قسمت در حال ویرایش باشد
}

const initialState: EpisodeState = {
  isLoadingUpdate: false,
  isLoadingStillUpload: false,
  error: null,
  successMessage: null,
  // selectedEpisodeDetail: null,
};

// --- Thunks ---
// Thunk آپدیت اطلاعات پایه قسمت
export const updateEpisode = createAsyncThunk<
  Episode,
  UpdateEpisodeThunkPayload
>(
  'episodeAdmin/updateEpisode', // نام مناسب برای typePrefix
  async ({ episodeId, updateData }, { rejectWithValue }) => {
    try {
      console.log(
        `[Thunk] Updating episode ${episodeId} with data:`,
        updateData
      );
      const responseData = await apiPut(`/episodes/${episodeId}`, updateData); // اندپوینت PUT /episodes/:id
      if (responseData?.status === 'success' && responseData?.data?.episode) {
        return responseData.data.episode as Episode;
      } else {
        throw new Error(
          responseData?.message || 'ساختار پاسخ آپدیت قسمت نامعتبر است'
        );
      }
    } catch (error: any) {
      console.error(`[Thunk] Error updating episode ${episodeId}:`, error);
      return rejectWithValue({
        message: error.message || 'خطا در به‌روزرسانی قسمت',
      } as AuthError);
    }
  }
);

// Thunk آپلود عکس صحنه (Still) قسمت
export const uploadEpisodeStill = createAsyncThunk<
  Episode,
  UploadEpisodeStillThunkPayload
>(
  'episodeAdmin/uploadStill',
  async ({ episodeId, file }, { rejectWithValue }) => {
    const formData = new FormData();
    formData.append('stillImage', file); // نام فیلد مطابق با multer سرور
    try {
      console.log(`[Thunk] Uploading still for episode ${episodeId}...`);
      const responseData = await apiPutFormData(
        `/episodes/${episodeId}/still`,
        formData
      ); // اندپوینت PUT /episodes/:id/still
      if (responseData?.status === 'success' && responseData?.data?.episode) {
        return responseData.data.episode as Episode;
      } else {
        throw new Error(
          responseData?.message || 'ساختار پاسخ آپلود عکس صحنه نامعتبر است'
        );
      }
    } catch (error: any) {
      console.error(
        `[Thunk] Error uploading still for episode ${episodeId}:`,
        error
      );
      return rejectWithValue({
        message: error.message || 'خطا در آپلود عکس صحنه قسمت',
      } as AuthError);
    }
  }
);

// --- Slice ---
const episodeSlice = createSlice({
  name: 'episodeAdmin',
  initialState,
  reducers: {
    clearEpisodeError: (state) => {
      state.error = null;
    },
    clearEpisodeSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update Episode Info
      .addCase(updateEpisode.pending, (state) => {
        state.isLoadingUpdate = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateEpisode.fulfilled, (state, action) => {
        state.isLoadingUpdate = false;
        state.successMessage = 'اطلاعات قسمت به‌روز شد.';
      })
      .addCase(updateEpisode.rejected, (state, action) => {
        state.isLoadingUpdate = false;
        state.error = action.payload as AuthError;
      })

      // Upload Episode Still
      .addCase(uploadEpisodeStill.pending, (state) => {
        state.isLoadingStillUpload = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(uploadEpisodeStill.fulfilled, (state, action) => {
        state.isLoadingStillUpload = false;
        state.successMessage = 'عکس صحنه قسمت آپلود شد.';
      })
      .addCase(uploadEpisodeStill.rejected, (state, action) => {
        state.isLoadingStillUpload = false;
        state.error = action.payload as AuthError;
      });
  },
});

// --- Exports ---
export const { clearEpisodeError, clearEpisodeSuccessMessage } =
  episodeSlice.actions;
export default episodeSlice.reducer;

// --- Selectors ---
export const selectEpisodeIsLoadingUpdate = (state: RootState) =>
  state.episodeAdmin.isLoadingUpdate;
export const selectEpisodeIsLoadingStillUpload = (state: RootState) =>
  state.episodeAdmin.isLoadingStillUpload;
export const selectEpisodeError = (state: RootState) =>
  state.episodeAdmin.error;
export const selectEpisodeSuccessMessage = (state: RootState) =>
  state.episodeAdmin.successMessage;
