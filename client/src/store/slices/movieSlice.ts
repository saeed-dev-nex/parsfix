import {
  Genre,
  FetchMoviesParams,
  MoviesApiResponse,
  UpdateMoviePayload,
} from './../../types/index';
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  apiPutFormData,
} from '@/lib/apiHelper';
import {
  CreateMoviePayload,
  Movie,
  MovieAdminList,
  MovieStatus,
} from '@/types';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthError } from 'firebase/auth';
import { RootState } from '../store';

// ---------------------- A. Types ----------------------
// This is the type of the action that will be dispatched to fetch movies

// Define structure of the state
interface MovieState {
  movies: MovieAdminList[]; // لیست برای جدول
  selectedMovieDetail: Movie | null; // جزئیات فیلم انتخاب شده برای ویرایش
  allGenres: Genre[];
  totalMovies: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  isLoadingList: boolean; // loading for List
  isLoadingDetails: boolean; //loading for details
  isLoadingCreateUpdate: boolean; //Loading for create or Update
  isLoadingGenres: boolean; //Loading for geners
  isLoadingImageUpload: boolean;
  error: AuthError | null;
  successMessage: string | null; // برای پیام‌های موفقیت (اختیاری)
}
// ---------------------- B. Initial State ----------------------
const initialState: MovieState = {
  movies: [],
  selectedMovieDetail: null, // مقدار اولیه
  allGenres: [],
  totalMovies: 0,
  totalPages: 0,
  currentPage: 1,
  limit: 10,
  isLoadingList: false, // نامگذاری واضح‌تر state های لودینگ
  isLoadingDetails: false,
  isLoadingCreateUpdate: false,
  isLoadingGenres: false,
  isLoadingImageUpload: false,
  error: null,
  successMessage: null,
};

// ---------------------- C. Async Thunk Functions ----------------------
// C-1. fechMovies: This function fetches movies from the API and returns the response data.
export const fetchMovies = createAsyncThunk<
  MoviesApiResponse,
  FetchMoviesParams
>('movies/fetchMovies', async (params = {}, { rejectWithValue }) => {
  try {
    const responseData = await apiGet('/movies', {
      params: params as Record<
        string,
        string | number | boolean | null | undefined
      >,
    });
    if (responseData?.status === 'success' && responseData?.data) {
      return responseData.data as MoviesApiResponse;
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error: any) {
    console.error('Error fetching movies:', error);
    return rejectWithValue({
      message: error.message || 'خطا در واکشی فیلم‌ها',
      code: error.code, // ارسال کد خطا اگر وجود داشت
    } as AuthError);
  }
});

// C-2. createMovie: This function creates a new movie and returns the response data.
export const createMovie = createAsyncThunk<Movie, CreateMoviePayload>(
  'movies/createMovie',
  async (movieData, { rejectWithValue }) => {
    try {
      console.log('Dispatching createMovie with data:', movieData);
      // ارسال درخواست POST به سرور
      const responseData = await apiPost('/movies', movieData); // اندپوینت ایجاد فیلم

      if (
        responseData &&
        responseData.status === 'success' &&
        responseData.data &&
        responseData.data.movie
      ) {
        console.log('createMovie Thunk: Success condition met.');
        return responseData.data.movie as Movie; // برگرداندن فیلم ایجاد شده
      } else {
        console.error(
          'createMovie Thunk: Invalid success response structure:',
          responseData
        );
        throw new Error(
          responseData?.message || 'ساختار پاسخ ایجاد فیلم نامعتبر است'
        );
      }
    } catch (error: any) {
      console.error('Create movie failed:', error);
      return rejectWithValue({
        message: error.message || 'خطا در ایجاد فیلم',
        code: error.code,
      } as AuthError);
    }
  }
);
// C-3. deleteMovie: This function delete a movie-----------------
export const deleteMovie = createAsyncThunk<string, string>(
  'movies/deleteMovie',
  async (movieId, { rejectWithValue }) => {
    try {
      console.log(`Attempting to delete movie with ID: ${movieId}`);
      // ارسال درخواست DELETE به سرور
      // پاسخ موفقیت آمیز 204 No Content است و بدنه ندارد (apiDelete آن را null برمی‌گرداند)
      await apiDelete(`/movies/${movieId}`);
      console.log(`Movie with ID: ${movieId} deleted successfully via API.`);
      return movieId; // ID فیلم حذف شده را برگردان تا در reducer استفاده شود
    } catch (error: any) {
      console.error(`Failed to delete movie ${movieId}:`, error);
      return rejectWithValue({
        message: error.message || 'خطا در حذف فیلم',
        code: error.code,
      } as AuthError);
    }
  }
);
//--------- C-4. Fetch Movie Details By ID Thunk----------
export const fetchMovieById = createAsyncThunk<Movie, string>( // ورودی: movieId, خروجی: Movie
  'movies/fetchMovieById',
  async (movieId, { rejectWithValue }) => {
    try {
      console.log(`Fetching details for movie ID: ${movieId}`);
      const responseData = await apiGet(`/movies/${movieId}`); // اندپوینت GET /:id
      if (responseData?.status === 'success' && responseData?.data?.movie) {
        return responseData.data.movie as Movie;
      } else {
        throw new Error(
          responseData?.message || 'ساختار پاسخ جزئیات فیلم نامعتبر است'
        );
      }
    } catch (error: any) {
      console.error(`Error fetching movie ${movieId}:`, error);
      return rejectWithValue({
        message: error.message || 'خطا در واکشی جزئیات فیلم',
      } as AuthError);
    }
  }
);
// -------------C-5. Update movie Thunk-------------

export const updateMovie = createAsyncThunk<Movie, UpdateMoviePayload>( // ورودی: ID و داده, خروجی: فیلم آپدیت شده
  'movies/updateMovie',
  async ({ movieId, updateData }, { rejectWithValue }) => {
    try {
      console.log(`Updating movie ${movieId} with data:`, updateData);
      const responseData = await apiPut(`/movies/${movieId}`, updateData); // اندپوینت PUT /:id

      if (responseData?.status === 'success' && responseData?.data?.movie) {
        return responseData.data.movie as Movie;
      } else {
        throw new Error(
          responseData?.message || 'ساختار پاسخ آپدیت فیلم نامعتبر است'
        );
      }
    } catch (error: any) {
      console.error(`Error updating movie ${movieId}:`, error);
      return rejectWithValue({
        message: error.message || 'خطا در به‌روزرسانی فیلم',
      } as AuthError);
    }
  }
);
// ---------C-6. Fetch All Genres
export const fetchGenres = createAsyncThunk<Genre[]>( // خروجی: آرایه ای از ژانرها
  'movies/fetchGenres', // یا 'genres/fetchGenres' اگر slice جدا دارید
  async (_, { rejectWithValue }) => {
    try {
      console.log('---------------Fetching all genres----------------');

      const responseData = await apiGet('/genres'); // اندپوینت GET /genres
      console.log(`Genres : ${responseData.data.genres}`);

      if (responseData?.status === 'success' && responseData?.data?.genres) {
        return responseData.data.genres as Genre[];
      } else {
        throw new Error(
          responseData?.message || 'ساختار پاسخ لیست ژانرها نامعتبر است'
        );
      }
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'خطا در واکشی ژانرها',
      } as AuthError);
    }
  }
);

// ---------------------- C-7. Update Movie Poster ----------------------
interface UploadImagePayload {
  movieId: string;
  file: File;
}
interface UploadImageResponse {
  movie: Movie;
}
export const uploadMoviePoster = createAsyncThunk<Movie, UploadImagePayload>(
  'movies/uploadPoster',
  async ({ movieId, file }, { rejectWithValue }) => {
    const formData = new FormData();
    formData.append('posterImage', file); // نام فیلد باید با multer ('posterImage') یکی باشد
    try {
      console.log(`Uploading poster for movie ${movieId}...`);
      // استفاده از apiPutFormData
      const responseData = await apiPutFormData(
        `/movies/${movieId}/poster`,
        formData
      );
      if (responseData?.status === 'success' && responseData?.data?.movie) {
        return responseData.data.movie as Movie; // برگرداندن فیلم آپدیت شده
      } else {
        throw new Error(responseData?.message || '...');
      }
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'خطا در آپلود پوستر',
      } as AuthError);
    }
  }
);

// ---------------------- C-7. Update Movie Backdrop ----------------------
export const uploadMovieBackdrop = createAsyncThunk<Movie, UploadImagePayload>(
  'movies/uploadBackdrop',
  async ({ movieId, file }, { rejectWithValue }) => {
    const formData = new FormData();
    formData.append('backdropImage', file); // نام فیلد باید با multer ('backdropImage') یکی باشد
    try {
      console.log(`Uploading backdrop for movie ${movieId}...`);
      const responseData = await apiPutFormData(
        `/movies/${movieId}/backdrop`,
        formData
      );
      if (responseData?.status === 'success' && responseData?.data?.movie) {
        return responseData.data.movie as Movie;
      } else {
        throw new Error(responseData?.message || '...');
      }
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'خطا در آپلود بک‌دراپ',
      } as AuthError);
    }
  }
);

// ---------------------- D. Slice ----------------------
const movieSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    // Reducer های همزمان اگر نیاز باشد (مثلا برای پاک کردن خطا)
    clearMovieError: (state) => {
      state.error = null;
    },
    clearMovieSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearSelectedMovie: (state) => {
      state.selectedMovieDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Movies List
      .addCase(fetchMovies.pending, (state) => {
        state.isLoadingList = true;
        state.error = null;
      })
      .addCase(
        fetchMovies.fulfilled,
        (state, action: PayloadAction<MoviesApiResponse>) => {
          state.isLoadingList = false;
          state.movies = action.payload.movies;
          state.totalMovies = action.payload.totalMovies;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.currentPage;
          state.limit = action.payload.limit;
        }
      )
      .addCase(fetchMovies.rejected, (state, action) => {
        state.isLoadingList = false;
        state.error = action.payload as AuthError;
      })

      // Fetch Movie By ID
      .addCase(fetchMovieById.pending, (state) => {
        state.isLoadingDetails = true;
        state.error = null;
        state.selectedMovieDetail = null;
      })
      .addCase(
        fetchMovieById.fulfilled,
        (state, action: PayloadAction<Movie>) => {
          state.isLoadingDetails = false;
          state.selectedMovieDetail = action.payload;
        }
      )
      .addCase(fetchMovieById.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.error = action.payload as AuthError;
      })

      // Create Movie
      .addCase(createMovie.pending, (state) => {
        state.isLoadingCreateUpdate = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createMovie.fulfilled, (state, action: PayloadAction<Movie>) => {
        state.isLoadingCreateUpdate = false;
        state.movies.unshift(action.payload as MovieAdminList); // Add to list
        state.totalMovies += 1;
        state.successMessage = 'فیلم با موفقیت ایجاد شد.';
      })
      .addCase(createMovie.rejected, (state, action) => {
        state.isLoadingCreateUpdate = false;
        state.error = action.payload as AuthError;
      })

      // Update Movie
      .addCase(updateMovie.pending, (state) => {
        state.isLoadingCreateUpdate = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateMovie.fulfilled, (state, action: PayloadAction<Movie>) => {
        state.isLoadingCreateUpdate = false;
        state.error = null;
        state.successMessage = 'فیلم با موفقیت به‌روزرسانی شد.';
        // آپدیت فیلم در لیست movies state
        const index = state.movies.findIndex(
          (movie) => movie.id === action.payload.id
        );
        if (index !== -1) {
          // فقط فیلدهایی که در لیست هستند را آپدیت کن
          const updatedMovieInList: MovieAdminList = {
            ...state.movies[index], // حفظ فیلدهای قبلی لیست
            title: action.payload.title,
            tmdbId: action.payload.tmdbId,
            releaseDate: action.payload.releaseDate,
            status: action.payload.status,
            imdbRating: action.payload.imdbRating,
            rottenTomatoesScore: action.payload.rottenTomatoesScore,
            posterPath: action.payload.posterPath,
            // addedBy و _count معمولا در پاسخ آپدیت نمی آیند مگر اینکه select شوند
          };
          state.movies[index] = updatedMovieInList;
        }
        // آپدیت جزئیات فیلم انتخاب شده (اگر همین فیلم در حال ویرایش بود)
        if (state.selectedMovieDetail?.id === action.payload.id) {
          state.selectedMovieDetail = action.payload;
        }
      })
      .addCase(updateMovie.rejected, (state, action) => {
        state.isLoadingCreateUpdate = false;
        state.error = action.payload as AuthError;
      })

      // Delete Movie
      .addCase(deleteMovie.pending, (state) => {
        state.isLoadingCreateUpdate = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        deleteMovie.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoadingCreateUpdate = false;
          state.error = null;
          state.movies = state.movies.filter(
            (movie) => movie.id !== action.payload
          );
          state.totalMovies = Math.max(0, state.totalMovies - 1);
          state.successMessage = 'فیلم با موفقیت حذف شد.';
        }
      )
      .addCase(deleteMovie.rejected, (state, action) => {
        state.isLoadingCreateUpdate = false;
        state.error = action.payload as AuthError;
      })
      // --- Fetch Genres cases ---
      .addCase(fetchGenres.pending, (state) => {
        state.isLoadingGenres = true;
        // خطا یا پیام موفقیت را اینجا پاک نکنید چون ممکن است مربوط به عملیات دیگری باشد
      })
      .addCase(
        fetchGenres.fulfilled,
        (state, action: PayloadAction<Genre[]>) => {
          state.isLoadingGenres = false;
          state.allGenres = action.payload; // ذخیره لیست ژانرها
        }
      )
      .addCase(fetchGenres.rejected, (state, action) => {
        state.isLoadingGenres = false;
        // خطا را در error اصلی ذخیره کنیم یا یک error جدا برای ژانرها؟ فعلا در اصلی
        state.error = action.payload as AuthError;
        state.allGenres = []; // لیست خالی در صورت خطا
      })
      // --- Upload Poster ---
      .addCase(uploadMoviePoster.pending, (state) => {
        state.isLoadingImageUpload = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        uploadMoviePoster.fulfilled,
        (state, action: PayloadAction<Movie>) => {
          state.isLoadingImageUpload = false;
          state.successMessage = 'پوستر با موفقیت آپلود شد.';
          const updatedMovie = action.payload;
          // آپدیت selectedMovieDetail اگر در حال ویرایش همین فیلم بودیم
          if (state.selectedMovieDetail?.id === updatedMovie.id) {
            state.selectedMovieDetail.posterPath = updatedMovie.posterPath;
          }
          // آپدیت آیتم در لیست (فقط پوستر)
          const index = state.movies.findIndex((m) => m.id === updatedMovie.id);
          if (index !== -1) {
            state.movies[index].posterPath = updatedMovie.posterPath;
          }
        }
      )
      .addCase(uploadMoviePoster.rejected, (state, action) => {
        state.isLoadingImageUpload = false;
        state.error = action.payload as AuthError;
      })

      // --- Upload Backdrop ---
      .addCase(uploadMovieBackdrop.pending, (state) => {
        state.isLoadingImageUpload = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        uploadMovieBackdrop.fulfilled,
        (state, action: PayloadAction<Movie>) => {
          state.isLoadingImageUpload = false;
          state.successMessage = 'بک‌دراپ با موفقیت آپلود شد.';
          const updatedMovie = action.payload;
          if (state.selectedMovieDetail?.id === updatedMovie.id) {
            state.selectedMovieDetail.backdropPath = updatedMovie.backdropPath;
          }
          // Backdrop is not shown in admin list, so we don't need to update it there
          // const index = state.movies.findIndex((m) => m.id === updatedMovie.id);
        }
      )
      .addCase(uploadMovieBackdrop.rejected, (state, action) => {
        state.isLoadingImageUpload = false;
        state.error = action.payload as AuthError;
      });
  },
});

export const { clearMovieError, clearMovieSuccessMessage, clearSelectedMovie } =
  movieSlice.actions;
export default movieSlice.reducer;
// Selectors
export const selectAllMovies = (state: RootState) => state.movies.movies;
export const selectMoviePaginationData = (state: RootState) => ({
  // تعداد کل رکوردها در دیتابیس (برای DataGrid rowCount)
  totalRowCount: state.movies.totalMovies,
  // تعداد کل صفحات محاسبه شده توسط سرور
  totalPages: state.movies.totalPages,
  // صفحه فعلی (که از سرور آمده، معمولا 1-based)
  currentPage: state.movies.currentPage,
  // تعداد آیتم در هر صفحه (pageSize برای DataGrid)
  pageSize: state.movies.limit,
});
export const selectMovieIsLoadingList = (state: RootState) =>
  state.movies.isLoadingList;
export const selectMovieIsLoadingDetails = (state: RootState) =>
  state.movies.isLoadingDetails;
export const selectMovieIsLoadingCreateUpdate = (state: RootState) =>
  state.movies.isLoadingCreateUpdate;
export const selectMovieError = (state: RootState) => state.movies.error;
export const selectSelectedMovieDetail = (state: RootState) =>
  state.movies.selectedMovieDetail;
export const selectMovieSuccessMessage = (state: RootState) =>
  state.movies.successMessage; // سلکتور پیام موفقیت
export const selectAllGenres = (state: RootState) => state.movies.allGenres; // <-- سلکتور جدید
export const selectMovieIsLoadingGenres = (state: RootState) =>
  state.movies.isLoadingGenres;
export const selectMovieIsLoadingImageUpload = (state: RootState) =>
  state.movies.isLoadingImageUpload;