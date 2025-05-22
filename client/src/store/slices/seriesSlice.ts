import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  apiPutFormData,
} from '@/lib/apiHelper'; // فقط Get لازم است فعلا
import {
  SeriesAdminList,
  FetchSeriesParams,
  SeriesApiResponse,
  AuthError,
  Series,
  CreateSeriesPayload,
  UpdateSeriesPayload,
  Genre,
  Season,
} from '@/types';
import { RootState } from '../store';
import { updateSeason, uploadSeasonPoster } from './seasonSlice';

// --- State ---
interface SeriesState {
  seriesList: SeriesAdminList[];
  allGenres: Genre[];
  selectedSeriesDetail: Series | null; // <-- برای جزئیات/ویرایش
  totalSeries: number;
  totalPages: number;
  currentPage: number;
  processingMessage: string | null;
  limit: number;
  isLoadingList: boolean;
  isLoadingDetails: boolean;
  isLoadingGenres: boolean;
  isProcessing: boolean;
  isLoadingImageUpload: boolean;
  error: AuthError | null;
  successMessage: string | null;
}

const initialState: SeriesState = {
  seriesList: [],
  allGenres: [],
  selectedSeriesDetail: null,
  processingMessage: null,
  totalSeries: 0,
  totalPages: 0,
  currentPage: 1,
  limit: 10,
  isLoadingList: false,
  isLoadingDetails: false,
  isProcessing: false,
  isLoadingGenres: false,
  isLoadingImageUpload: false,
  error: null,
  successMessage: null,
};

// --- Thunk واکشی لیست سریال‌ها ---
export const fetchSeries = createAsyncThunk<
  SeriesApiResponse,
  FetchSeriesParams
>(
  'series/fetchSeries',
  async (params = { page: 1, limit: 10 }, { rejectWithValue }) => {
    try {
      console.log('Fetching series with params:', params);
      const responseData = await apiGet('/series', {
        params: params as Record<
          string,
          string | number | boolean | null | undefined
        >,
      }); // اندپوینت GET /series
      if (responseData?.status === 'success' && responseData?.data) {
        return responseData.data as SeriesApiResponse;
      } else {
        throw new Error(
          responseData?.message || 'ساختار پاسخ لیست سریال‌ها نامعتبر است'
        );
      }
    } catch (error: any) {
      console.error('Error fetching series:', error);
      return rejectWithValue({
        message: error.message || 'خطا در واکشی سریال‌ها',
      } as AuthError);
    }
  }
);
// --- Thunk جدید: ایجاد سریال ---
/**
 * Thunk برای ایجاد سریال جدید از طریق سرور
 * @param {CreateSeriesPayload} seriesData - شامل tmdbId و status
 * @returns {Promise<Series>} - آبجکت سریال کامل ایجاد شده
 */
export const createSeries = createAsyncThunk<Series, CreateSeriesPayload>(
  'seriesAdmin/createSeries', // <-- نام اکشن تایپ
  async (seriesData, { rejectWithValue }) => {
    try {
      console.log('[Thunk] Dispatching createSeries with data:', seriesData);
      // ارسال درخواست POST به اندپوینت /series سرور
      const responseData = await apiPost('/series', seriesData);

      if (responseData?.status === 'success' && responseData?.data?.series) {
        console.log(
          '[Thunk] Server successfully created series:',
          responseData.data.series
        );
        // برگرداندن آبجکت کامل سریال ایجاد شده
        return responseData.data.series as Series;
      } else {
        console.error(
          '[Thunk] Invalid response structure after creating series:',
          responseData
        );
        throw new Error(
          responseData?.message || 'ساختار پاسخ ایجاد سریال نامعتبر است'
        );
      }
    } catch (error: any) {
      console.error('[Thunk] Create series failed:', error);
      return rejectWithValue({
        message: error.message || 'خطا در ایجاد سریال',
        code: error.code, // کد خطای سفارشی (اگر وجود داشت)
      } as AuthError);
    }
  }
);

// --- Thunk: واکشی جزئیات سریال ---
export const fetchSeriesById = createAsyncThunk<Series, string>(
  'seriesAdmin/fetchById',
  async (seriesId, { rejectWithValue }) => {
    try {
      console.log('------------- get series By ID -------------');

      const responseData = await apiGet(`/series/${seriesId}`); // اندپوینت GET /series/:id (باید در سرور باشد)

      console.log('🚀 ~ responseData:', responseData);
      if (responseData?.status === 'success' && responseData?.data?.series) {
        return responseData.data.series as Series;
      } else {
        throw new Error(responseData?.message || '...');
      }
    } catch (error: any) {
      return rejectWithValue({ message: error.message || '...' } as AuthError);
    }
  }
);

// --- Thunk: آپدیت سریال ---
export const updateSeries = createAsyncThunk<Series, UpdateSeriesPayload>(
  'seriesAdmin/updateSeries',
  async ({ seriesId, updateData }, { rejectWithValue }) => {
    try {
      const responseData = await apiPut(`/series/${seriesId}`, updateData); // اندپوینت PUT /series/:id
      if (responseData?.status === 'success' && responseData?.data?.series) {
        return responseData.data.series as Series;
      } else {
        throw new Error(responseData?.message || '...');
      }
    } catch (error: any) {
      return rejectWithValue({ message: error.message || '...' } as AuthError);
    }
  }
);

// --- Thunk: حذف سریال ---
export const deleteSeries = createAsyncThunk<string, string>( // ورودی و خروجی ID
  'seriesAdmin/deleteSeries',
  async (seriesId, { rejectWithValue }) => {
    try {
      await apiDelete(`/series/${seriesId}`); // اندپوینت DELETE /series/:id
      return seriesId;
    } catch (error: any) {
      return rejectWithValue({ message: error.message || '...' } as AuthError);
    }
  }
);

// --- پایان Thunk جدید ---

export const fetchGenres = createAsyncThunk<Genre[]>(
  'seriesAdmin/fetchGenres', // یا یک نام عمومی‌تر اگر در slice جدا باشد
  async (_, { rejectWithValue }) => {
    try {
      const responseData = await apiGet('/genres');
      if (responseData?.status === 'success' && responseData?.data?.genres) {
        return responseData.data.genres as Genre[];
      } else {
        throw new Error(responseData?.message || '...');
      }
    } catch (error: any) {
      return rejectWithValue({ message: error.message || '...' } as AuthError);
    }
  }
);

// --- Thunk های جدید آپلود عکس سریال ---
interface UploadSeriesImagePayload {
  seriesId: string;
  file: File;
}

export const uploadSeriesPoster = createAsyncThunk<
  Series,
  UploadSeriesImagePayload
>(
  'seriesAdmin/uploadPoster',
  async ({ seriesId, file }, { rejectWithValue }) => {
    const formData = new FormData();
    formData.append('posterImage', file); // نام فیلد مطابق با multer سرور
    try {
      const responseData = await apiPutFormData(
        `/series/${seriesId}/poster`,
        formData
      );
      if (responseData?.status === 'success' && responseData?.data?.series) {
        return responseData.data.series as Series;
      } else {
        throw new Error(responseData?.message || '...');
      }
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'خطا در آپلود پوستر سریال',
      } as AuthError);
    }
  }
);

export const uploadSeriesBackdrop = createAsyncThunk<
  Series,
  UploadSeriesImagePayload
>(
  'seriesAdmin/uploadBackdrop',
  async ({ seriesId, file }, { rejectWithValue }) => {
    const formData = new FormData();
    formData.append('backdropImage', file); // نام فیلد مطابق با multer سرور
    try {
      const responseData = await apiPutFormData(
        `/series/${seriesId}/backdrop`,
        formData
      );
      if (responseData?.status === 'success' && responseData?.data?.series) {
        return responseData.data.series as Series;
      } else {
        throw new Error(responseData?.message || '...');
      }
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'خطا در آپلود بک‌دراپ سریال',
      } as AuthError);
    }
  }
);
// ----------------------------------

// TODO: Add thunks for  update, delete series later

// --- Slice ---
const seriesSlice = createSlice({
  name: 'seriesAdmin', // نام مناسب برای اسلایس مدیریت سریال در ادمین
  initialState,
  reducers: {
    clearSeriesError: (state) => {
      state.error = null;
    },
    clearSeriesSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearSeriesProcessingMessage: (state) => {
      state.processingMessage = null;
    },
    clearSelectedSeries: (state) => {
      state.selectedSeriesDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSeries.pending, (state) => {
        state.isLoadingList = true;
        state.error = null;
      })
      .addCase(
        fetchSeries.fulfilled,
        (state, action: PayloadAction<SeriesApiResponse>) => {
          state.isLoadingList = false;
          state.seriesList = action.payload.series;
          state.totalSeries = action.payload.totalSeries;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.currentPage;
          state.limit = action.payload.limit;
        }
      )
      .addCase(fetchSeries.rejected, (state, action) => {
        state.isLoadingList = false;
        state.error = action.payload as AuthError;
      })
      // --- Create Series cases ---
      .addCase(createSeries.pending, (state) => {
        state.isProcessing = true; // شروع پردازش
        state.error = null;
        state.successMessage = null;
        state.processingMessage =
          'در حال ایجاد سریال و واکشی اطلاعات... (این فرآیند ممکن است کمی طول بکشد)';
      })
      .addCase(
        createSeries.fulfilled,
        (state, action: PayloadAction<Series>) => {
          state.isProcessing = false; // پایان پردازش
          state.successMessage = 'سریال با موفقیت ایجاد شد.'; // پیام موفقیت
          // سریال جدید را به ابتدای لیست اضافه می‌کنیم (یا روش دیگر: لیست را دوباره fetch کنیم)
          state.seriesList.unshift(action.payload as SeriesAdminList); // Cast به نوع لیست
          state.totalSeries += 1; // افزایش تعداد کل
          console.log('Series added to state:', action.payload);
          state.processingMessage = null;
        }
      )
      .addCase(createSeries.rejected, (state, action) => {
        state.isProcessing = false; // پایان پردازش
        state.processingMessage = null;
        state.error = action.payload as AuthError; // ثبت خطا
      })
      .addCase(fetchSeriesById.pending, (s) => {
        s.isLoadingDetails = true;
        s.error = null;
        s.selectedSeriesDetail = null;
        s.successMessage = null;
      })
      .addCase(fetchSeriesById.fulfilled, (s, a) => {
        s.isLoadingDetails = false;
        s.selectedSeriesDetail = a.payload;
      })
      .addCase(fetchSeriesById.rejected, (s, a) => {
        s.isLoadingDetails = false;
        s.error = a.payload as AuthError;
      })

      // Update
      .addCase(updateSeries.pending, (s) => {
        s.isProcessing = true;
        s.error = null;
        s.successMessage = null;
      })
      .addCase(updateSeries.fulfilled, (s, a) => {
        s.isProcessing = false;
        s.successMessage = 'سریال به‌روزرسانی شد.';
        const index = s.seriesList.findIndex((x) => x.id === a.payload.id);
        if (index !== -1) s.seriesList[index] = a.payload; // آپدیت لیست
        if (s.selectedSeriesDetail?.id === a.payload.id)
          s.selectedSeriesDetail = a.payload; // آپدیت جزئیات
      })
      .addCase(updateSeries.rejected, (s, a) => {
        s.isProcessing = false;
        s.error = a.payload as AuthError;
      })
      // Delete
      .addCase(deleteSeries.pending, (s) => {
        s.isProcessing = true;
        s.error = null;
        s.successMessage = null;
      })
      .addCase(deleteSeries.fulfilled, (s, a) => {
        // payload is seriesId
        s.isProcessing = false;
        s.successMessage = 'سریال حذف شد.';
        s.seriesList = s.seriesList.filter((x) => x.id !== a.payload);
        s.totalSeries = Math.max(0, s.totalSeries - 1);
      })
      .addCase(deleteSeries.rejected, (s, a) => {
        s.isProcessing = false;
        s.error = a.payload as AuthError;
      })
      // --- Fetch Genres cases ---
      .addCase(fetchGenres.pending, (state) => {
        state.isLoadingGenres = true;
      })
      .addCase(
        fetchGenres.fulfilled,
        (state, action: PayloadAction<Genre[]>) => {
          state.isLoadingGenres = false;
          state.allGenres = action.payload;
        }
      )
      .addCase(fetchGenres.rejected, (state, action) => {
        state.isLoadingGenres = false;
        state.error = action.payload as AuthError;
        state.allGenres = [];
      }) // --- Upload Poster cases ---
      .addCase(uploadSeriesPoster.pending, (state) => {
        state.isLoadingImageUpload = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        uploadSeriesPoster.fulfilled,
        (state, action: PayloadAction<Series>) => {
          state.isLoadingImageUpload = false;
          state.successMessage = 'پوستر سریال آپلود شد.';
          const updatedSeries = action.payload;
          if (state.selectedSeriesDetail?.id === updatedSeries.id) {
            state.selectedSeriesDetail.posterPath = updatedSeries.posterPath;
          }
          const index = state.seriesList.findIndex(
            (s) => s.id === updatedSeries.id
          );
          if (index !== -1) {
            state.seriesList[index].posterPath = updatedSeries.posterPath;
          }
        }
      )
      .addCase(uploadSeriesPoster.rejected, (state, action) => {
        state.isLoadingImageUpload = false;
        state.error = action.payload as AuthError;
      })

      // --- Upload Backdrop cases ---
      .addCase(uploadSeriesBackdrop.pending, (state) => {
        state.isLoadingImageUpload = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        uploadSeriesBackdrop.fulfilled,
        (state, action: PayloadAction<Series>) => {
          state.isLoadingImageUpload = false;
          state.successMessage = 'بک‌دراپ سریال آپلود شد.';
          const updatedSeries = action.payload;
          if (state.selectedSeriesDetail?.id === updatedSeries.id) {
            state.selectedSeriesDetail.backdropPath =
              updatedSeries.backdropPath;
          }
          // بک‌دراپ معمولا در لیست ادمین نیست، آپدیت لیست لازم نیست
          // const index = state.seriesList.findIndex(s => s.id === updatedSeries.id);
          // if (index !== -1) { state.seriesList[index].backdropPath = updatedSeries.backdropPath; }
        }
      )
      .addCase(uploadSeriesBackdrop.rejected, (state, action) => {
        state.isLoadingImageUpload = false;
        state.error = action.payload as AuthError;
      })
      .addCase(
        updateSeason.fulfilled,
        (state, action: PayloadAction<Season>) => {
          // آپدیت فصل مربوطه در selectedSeriesDetail
          if (state.selectedSeriesDetail?.seasons) {
            const seasonIndex = state.selectedSeriesDetail.seasons.findIndex(
              (s) => s.id === action.payload.id
            );
            if (seasonIndex !== -1) {
              // فقط فیلدهای پایه که در payload فصل هستند را آپدیت کن
              state.selectedSeriesDetail.seasons[seasonIndex] = {
                ...state.selectedSeriesDetail.seasons[seasonIndex], // حفظ قسمت‌ها و سایر فیلدها
                ...action.payload, // بازنویسی فیلدهای آپدیت شده
              };
            }
          }
        }
      )
      .addCase(
        uploadSeasonPoster.fulfilled,
        (state, action: PayloadAction<Season>) => {
          // آپدیت پوستر فصل مربوطه در selectedSeriesDetail
          if (state.selectedSeriesDetail?.seasons) {
            const seasonIndex = state.selectedSeriesDetail.seasons.findIndex(
              (s) => s.id === action.payload.id
            );
            if (seasonIndex !== -1) {
              state.selectedSeriesDetail.seasons[seasonIndex].posterPath =
                action.payload.posterPath;
            }
          }
        }
      );
    // ---------------------------
  },
});

// --- Exports ---
export const {
  clearSeriesError,
  clearSeriesSuccessMessage,
  clearSeriesProcessingMessage,
  clearSelectedSeries,
} = seriesSlice.actions;
export default seriesSlice.reducer;

// --- Selectors ---
export const selectAllAdminSeries = (state: RootState) =>
  state.seriesAdmin.seriesList;
export const selectSeriesPaginationData = (state: RootState) => ({
  totalRowCount: state.seriesAdmin.totalSeries,
  totalPages: state.seriesAdmin.totalPages,
  currentPage: state.seriesAdmin.currentPage,
  pageSize: state.seriesAdmin.limit,
});
export const selectSeriesIsLoading = (state: RootState) =>
  state.seriesAdmin.isLoadingList;
export const selectSeriesIsProcessing = (state: RootState) =>
  state.seriesAdmin.isProcessing;
export const selectSeriesError = (state: RootState) => state.seriesAdmin.error;
export const selectSeriesSuccessMessage = (state: RootState) =>
  state.seriesAdmin.successMessage;
export const selectSeriesProcessingMessage = (state: RootState) =>
  state.seriesAdmin.processingMessage;
export const selectSelectedSeriesDetail = (state: RootState) =>
  state.seriesAdmin.selectedSeriesDetail;
export const selectAllGenres = (state: RootState) =>
  state.seriesAdmin.allGenres; // <-- سلکتور ژانرها
export const selectSeriesIsLoadingGenres = (state: RootState) =>
  state.seriesAdmin.isLoadingGenres; // <-- سلکتور لودینگ ژانرها
export const selectSeriesIsLoadingImageUpload = (state: RootState) =>
  state.seriesAdmin.isLoadingImageUpload;
