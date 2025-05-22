import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiPut, apiPutFormData } from '@/lib/apiHelper';
import {
  Season,
  AuthError,
  UpdateSeasonData,
  UpdateSeasonThunkPayload,
  UploadSeasonPosterThunkPayload,
} from '@/types';
import { RootState } from '../store';

// --- State ---
interface SeasonState {
  isLoadingUpdate: boolean;
  isLoadingPosterUpload: boolean;
  error: AuthError | null;
  successMessage: string | null;
}

const initialState: SeasonState = {
  isLoadingUpdate: false,
  isLoadingPosterUpload: false,
  error: null,
  successMessage: null,
};

// --- Thunks ---
// Thunk آپدیت اطلاعات پایه فصل
export const updateSeason = createAsyncThunk<Season, UpdateSeasonThunkPayload>(
  'season/updateSeason',
  async ({ seasonId, updateData }, { rejectWithValue }) => {
    try {
      const responseData = await apiPut(`/seasons/${seasonId}`, updateData);
      if (responseData?.status === 'success' && responseData?.data?.season) {
        return responseData.data.season as Season;
      } else {
        throw new Error(responseData?.message || '...');
      }
    } catch (error: any) {
      return rejectWithValue({ message: error.message || '...' } as AuthError);
    }
  }
);

// Thunk آپلود پوستر فصل
export const uploadSeasonPoster = createAsyncThunk<
  Season,
  UploadSeasonPosterThunkPayload
>('season/uploadPoster', async ({ seasonId, file }, { rejectWithValue }) => {
  const formData = new FormData();
  formData.append('posterImage', file); // نام فیلد مطابق multer سرور
  try {
    const responseData = await apiPutFormData(
      `/seasons/${seasonId}/poster`,
      formData
    );
    if (responseData?.status === 'success' && responseData?.data?.season) {
      return responseData.data.season as Season;
    } else {
      throw new Error(responseData?.message || '...');
    }
  } catch (error: any) {
    return rejectWithValue({ message: error.message || '...' } as AuthError);
  }
});

// --- Slice ---
const seasonSlice = createSlice({
  name: 'seasonAdmin', // نام slice
  initialState,
  reducers: {
    clearSeasonError: (state) => {
      state.error = null;
    },
    clearSeasonSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update Season Info
      .addCase(updateSeason.pending, (state) => {
        state.isLoadingUpdate = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateSeason.fulfilled, (state, action) => {
        state.isLoadingUpdate = false;
        state.successMessage = 'اطلاعات فصل به‌روز شد.';
      })
      .addCase(updateSeason.rejected, (state, action) => {
        state.isLoadingUpdate = false;
        state.error = action.payload as AuthError;
      })
      // Upload Season Poster
      .addCase(uploadSeasonPoster.pending, (state) => {
        state.isLoadingPosterUpload = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(uploadSeasonPoster.fulfilled, (state, action) => {
        state.isLoadingPosterUpload = false;
        state.successMessage = 'پوستر فصل آپلود شد.';
      })
      .addCase(uploadSeasonPoster.rejected, (state, action) => {
        state.isLoadingPosterUpload = false;
        state.error = action.payload as AuthError;
      });
  },
});

// --- Exports ---
export const { clearSeasonError, clearSeasonSuccessMessage } =
  seasonSlice.actions;
export default seasonSlice.reducer;

// --- Selectors ---
export const selectSeasonIsLoadingUpdate = (state: RootState) =>
  state.seasonAdmin.isLoadingUpdate;
export const selectSeasonIsLoadingPosterUpload = (state: RootState) =>
  state.seasonAdmin.isLoadingPosterUpload;
export const selectSeasonError = (state: RootState) => state.seasonAdmin.error;
export const selectSeasonSuccessMessage = (state: RootState) =>
  state.seasonAdmin.successMessage;
