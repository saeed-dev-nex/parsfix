import { apiGet } from '@/lib/apiHelper';
import {
  AuthError,
  FetchPublicMoviesParams,
  MediaItem,
  MovieFilterOptions,
  PublicMoviesApiResponse,
} from '@/types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface PublicContentState {
  movies: MediaItem[];
  newestMoviesSlider: MediaItem[];
  movieFilterOptions: MovieFilterOptions | null;

  totalMovies: number;
  totalPages: number;
  currentPage: number;
  limit: number;

  isLoadingMovies: boolean;
  isLoadingNewestMovies: boolean;
  isLoadingMovieFilterOptions: boolean;
  error: AuthError | null;
}

const initialState: PublicContentState = {
  movies: [],
  newestMoviesSlider: [],
  movieFilterOptions: null,

  totalMovies: 0,
  totalPages: 0,
  currentPage: 1,
  limit: 20,

  isLoadingMovies: false,
  isLoadingNewestMovies: false,
  isLoadingMovieFilterOptions: false,
  error: null,
};

// --- Thunks ---
export const fetchPublicMovies = createAsyncThunk<
  PublicMoviesApiResponse,
  FetchPublicMoviesParams
>(
  'publicContent/fetchMovies',
  async (params = { page: 1, limit: 20 }, { rejectWithValue }) => {
    try {
      // اندپوینت GET /public-movies یا /movies (بسته به تنظیمات روت شما)
      const responseData = await apiGet('/public-movies', { params });
      if (responseData?.status === 'success' && responseData?.data) {
        return responseData.data as PublicMoviesApiResponse;
      } else {
        throw new Error(responseData?.message || '...');
      }
    } catch (error: any) {
      return rejectWithValue({ message: error.message || '...' } as AuthError);
    }
  }
);

export const fetchMovieFilterOptions = createAsyncThunk<MovieFilterOptions>(
  'publicContent/fetchMovieFilterOptions',
  async (_, { rejectWithValue }) => {
    try {
      // اندپوینت GET /public-movies/filter-options
      const responseData = await apiGet('/public-movies/filter-options');
      if (responseData?.status === 'success' && responseData?.data) {
        return responseData.data as MovieFilterOptions;
      } else {
        throw new Error(responseData?.message || '...');
      }
    } catch (error: any) {
      return rejectWithValue({ message: error.message || '...' } as AuthError);
    }
  }
);

export const fetchNewestMoviesSlider = createAsyncThunk<MediaItem[], number>(
  'publicContent/fetchNewestMoviesSlider',
  async (limit = 10, { rejectWithValue }) => {
    // limit به عنوان پارامتر
    try {
      // اندپوینت GET /content/newest-movies-slider
      const responseData = await apiGet('/content/newest-movies-slider', {
        params: { limit },
      });
      if (responseData?.status === 'success' && responseData?.data?.items) {
        return responseData.data.items as MediaItem[];
      } else {
        throw new Error(responseData?.message || '...');
      }
    } catch (error: any) {
      return rejectWithValue({ message: error.message || '...' } as AuthError);
    }
  }
);

const publicContentSlice = createSlice({
  name: 'publicContent',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Public Movies
      .addCase(fetchPublicMovies.pending, (s) => {
        s.isLoadingMovies = true;
        s.error = null;
      })
      .addCase(fetchPublicMovies.fulfilled, (s, a) => {
        s.isLoadingMovies = false;
        s.movies = a.payload.movies;
        s.totalMovies = a.payload.totalMovies;
        s.totalPages = a.payload.totalPages;
        s.currentPage = a.payload.currentPage;
        s.limit = a.payload.limit;
      })
      .addCase(fetchPublicMovies.rejected, (s, a) => {
        s.isLoadingMovies = false;
        s.error = a.payload as AuthError;
      })
      // Fetch Filter Options
      .addCase(fetchMovieFilterOptions.pending, (s) => {
        s.isLoadingMovieFilterOptions = true;
      })
      .addCase(fetchMovieFilterOptions.fulfilled, (s, a) => {
        s.isLoadingMovieFilterOptions = false;
        s.movieFilterOptions = a.payload;
      })
      .addCase(fetchMovieFilterOptions.rejected, (s, a) => {
        s.isLoadingMovieFilterOptions = false;
        s.error = a.payload as AuthError;
      })
      // Fetch Newest Movies Slider
      .addCase(fetchNewestMoviesSlider.pending, (s) => {
        s.isLoadingNewestMovies = true;
      })
      .addCase(fetchNewestMoviesSlider.fulfilled, (s, a) => {
        s.isLoadingNewestMovies = false;
        s.newestMoviesSlider = a.payload;
      })
      .addCase(fetchNewestMoviesSlider.rejected, (s, a) => {
        s.isLoadingNewestMovies = false;
        s.error = a.payload as AuthError;
      });
  },
});
export const publicContentActions = publicContentSlice.actions;
export default publicContentSlice.reducer;
