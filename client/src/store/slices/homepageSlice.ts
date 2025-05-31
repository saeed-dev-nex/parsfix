import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

import { apiGet } from '@/lib/apiHelper';
import {
  AuthError,
  HomepageState,
  MediaItem,
  MoviesApiResponse,
} from '@/types';

const initialState: HomepageState = {
  heroSliderItems: [],
  trendingMovies: [],
  recommendedShows: [],
  featuredItem: null,
  top10Movies: [],
  top10Series: [],
  upcomingMovies: [],
  upcomingSeries: [],

  isLoadingHero: false,
  isLoadingTrendingMovies: false,
  isLoadingRecommendedShows: false,
  isLoadingFeatured: false,
  isLoadingTop10Series: false,
  isLoadingTop10Movies: false,
  isLoadingUpcomingMovies: false,
  isLoadingUpcomingSeries: false,
  error: null,
};

// --- Async Thunks ---
// Thunk برای آیتم‌های Hero Slider
export const fetchHeroSliderItems = createAsyncThunk<MediaItem[]>(
  'homepage/fetchHeroItems',
  async (_, { rejectWithValue }) => {
    try {
      const responseData = await apiGet('/content/hero-items'); // اندپوینت سرور

      if (responseData?.status === 'success' && responseData?.data?.items) {
        return responseData.data.items as MediaItem[];
      } else {
        throw new Error(
          responseData?.message || 'ساختار پاسخ هیرو نامعتبر است'
        );
      }
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'خطا در واکشی آیتم‌های هیرو',
      } as AuthError);
    }
  }
);

// Thunk برای فیلم‌های پرطرفدار
export const fetchTrendingMovies = createAsyncThunk<MediaItem[]>(
  'homepage/fetchTrendingMovies',
  async (_, { rejectWithValue }) => {
    // می‌توانید پارامترهای page/limit هم بگیرید
    try {
      // فرض کنید اندپوینتی برای فیلم‌های پرطرفدار دارید
      const responseData = await apiGet('/content/trending-movies'); // یا /movies?sort=popularity&status=published
      if (responseData?.status === 'success' && responseData?.data?.items) {
        // یا responseData.data.movies
        return responseData.data.items as MediaItem[];
      } else {
        throw new Error(responseData?.message || '...');
      }
    } catch (error: any) {
      return rejectWithValue({ message: error.message || '...' } as AuthError);
    }
  }
);

// Thunk برای سریال‌های پیشنهادی
export const fetchRecommendedShows = createAsyncThunk<MediaItem[]>(
  'homepage/fetchRecommendedShows',
  async (_, { rejectWithValue }) => {
    try {
      const responseData = await apiGet('/content/recommended-shows'); // یا /series?filter=recommended...
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

// Thunk برای آیتم ویژه
export const fetchFeaturedItem = createAsyncThunk<MediaItem>(
  'homepage/fetchFeaturedItem',
  async (_, { rejectWithValue }) => {
    try {
      const responseData = await apiGet('/content/featured-item'); // یک آیتم خاص
      if (responseData?.status === 'success' && responseData?.data?.item) {
        return responseData.data.item as MediaItem;
      } else {
        throw new Error(responseData?.message || '...');
      }
    } catch (error: any) {
      return rejectWithValue({ message: error.message || '...' } as AuthError);
    }
  }
);
export const fetchTop10Movies = createAsyncThunk<MediaItem[]>(
  'homepage/fetchTop10Movies',
  async (_, { rejectWithValue }) => {
    try {
      const responseData = await apiGet('/content/top-10-movies');
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

export const fetchTop10Series = createAsyncThunk<MediaItem[]>(
  'homepage/fetchTop10Series',
  async (_, { rejectWithValue }) => {
    try {
      const responseData = await apiGet('/content/top-10-series');
      if (responseData?.status === 'success' && responseData?.data?.items) {
        console.log(
          'This is result of top 10 series in home slice: ',
          responseData.data.items
        );
        return responseData.data.items as MediaItem[];
      } else {
        throw new Error(responseData?.message || '...');
      }
    } catch (error: any) {
      return rejectWithValue({ message: error.message || '...' } as AuthError);
    }
  }
);

// >>> اضافه کردن Thunk های جدید برای محتوای آتی <<<
interface FetchUpcomingParams {
  limit?: number;
  page?: number;
}

export const fetchUpcomingMovies = createAsyncThunk<
  MediaItem[],
  FetchUpcomingParams | void // پارامترها اختیاری هستند
>('homepage/fetchUpcomingMovies', async (params, { rejectWithValue }) => {
  console.log('<-------------- UPCOMING MOVIES SLICE ---------------->');

  try {
    const queryParams = params
      ? new URLSearchParams(
          Object.entries(params).filter(
            ([, value]) => value !== undefined
          ) as any
        ).toString()
      : '';

    const responseData = await apiGet(`/content/upcoming-movies`);
    console.log('Responce recived from server UCOMINGMOVIE : ', responseData);

    if (
      responseData &&
      responseData.status === 'success' &&
      responseData.data?.items
    ) {
      return responseData.data.items;
    } else {
      throw new Error(responseData?.message || '...');
    }
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'An unknown error occurred',
    });
  }
});

export const fetchUpcomingSeries = createAsyncThunk<
  MediaItem[],
  FetchUpcomingParams | void // پارامترها اختیاری هستند
>('homepage/fetchUpcomingSeries', async (params, { rejectWithValue }) => {
  try {
    const queryParams = params
      ? new URLSearchParams(
          Object.entries(params).filter(
            ([, value]) => value !== undefined
          ) as any
        ).toString()
      : '';
    const responseData = await apiGet(
      `/content/upcoming-series?${queryParams}`
    );
    if (
      responseData &&
      responseData.status === 'success' &&
      responseData.data?.items
    ) {
      return responseData.data.items;
    } else {
      throw new Error(responseData?.message || '...');
    }
  } catch (error: any) {
    return rejectWithValue({
      message: error.message || 'An unknown error occurred',
    });
  }
});

// --- Slice ---
const homepageSlice = createSlice({
  name: 'homepage',
  initialState,
  reducers: {
    clearHomepageError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Hero Slider
      .addCase(fetchHeroSliderItems.pending, (state) => {
        state.isLoadingHero = true;
        state.error = null;
      })
      .addCase(
        fetchHeroSliderItems.fulfilled,
        (state, action: PayloadAction<MediaItem[]>) => {
          state.isLoadingHero = false;
          state.heroSliderItems = action.payload;
        }
      )
      .addCase(fetchHeroSliderItems.rejected, (state, action) => {
        state.isLoadingHero = false;
        state.error = action.payload as AuthError;
      })
      // Trending Movies
      .addCase(fetchTrendingMovies.pending, (state) => {
        state.isLoadingTrendingMovies = true;
        state.error = null;
      })
      .addCase(
        fetchTrendingMovies.fulfilled,
        (state, action: PayloadAction<MediaItem[]>) => {
          state.isLoadingTrendingMovies = false;
          state.trendingMovies = action.payload;
        }
      )
      .addCase(fetchTrendingMovies.rejected, (state, action) => {
        state.isLoadingTrendingMovies = false;
        state.error = action.payload as AuthError;
      })
      // Recommended Shows
      .addCase(fetchRecommendedShows.pending, (state) => {
        state.isLoadingRecommendedShows = true;
        state.error = null;
      })
      .addCase(
        fetchRecommendedShows.fulfilled,
        (state, action: PayloadAction<MediaItem[]>) => {
          state.isLoadingRecommendedShows = false;
          state.recommendedShows = action.payload;
        }
      )
      .addCase(fetchRecommendedShows.rejected, (state, action) => {
        state.isLoadingRecommendedShows = false;
        state.error = action.payload as AuthError;
      })
      // Featured Item
      .addCase(fetchFeaturedItem.pending, (state) => {
        state.isLoadingFeatured = true;
        state.error = null;
      })
      .addCase(
        fetchFeaturedItem.fulfilled,
        (state, action: PayloadAction<MediaItem>) => {
          state.isLoadingFeatured = false;
          state.featuredItem = action.payload;
        }
      )
      .addCase(fetchFeaturedItem.rejected, (state, action) => {
        state.isLoadingFeatured = false;
        state.error = action.payload as AuthError;
      })
      // Top 10 Movies
      .addCase(fetchTop10Movies.pending, (state) => {
        state.isLoadingTop10Movies = true;
        state.error = null;
      })
      .addCase(fetchTop10Movies.fulfilled, (state, action) => {
        state.isLoadingTop10Movies = false;
        state.top10Movies = action.payload;
      })
      .addCase(fetchTop10Movies.rejected, (state, action) => {
        state.isLoadingTop10Movies = false;
        state.error = action.payload as AuthError;
      })
      // Top 10 Series
      .addCase(fetchTop10Series.pending, (state) => {
        state.isLoadingTop10Series = true;
        state.error = null;
      })
      .addCase(fetchTop10Series.fulfilled, (state, action) => {
        state.isLoadingTop10Series = false;
        state.top10Series = action.payload;
      })
      .addCase(fetchTop10Series.rejected, (state, action) => {
        state.isLoadingTop10Series = false;
        state.error = action.payload as AuthError;
      })
      .addCase(fetchUpcomingMovies.pending, (state) => {
        state.isLoadingUpcomingMovies = true;
        state.error = null;
      })
      .addCase(
        fetchUpcomingMovies.fulfilled,
        (state, action: PayloadAction<MediaItem[]>) => {
          state.isLoadingUpcomingMovies = false;
          state.upcomingMovies = action.payload;
        }
      )
      .addCase(fetchUpcomingMovies.rejected, (state, action) => {
        state.isLoadingUpcomingMovies = false;
        state.error = action.payload as AuthError;
      })
      // >>> پایان بخش اضافه شده <<<

      // >>> اضافه کردن case ها برای fetchUpcomingSeries <<<
      .addCase(fetchUpcomingSeries.pending, (state) => {
        state.isLoadingUpcomingSeries = true;
        state.error = null;
      })
      .addCase(
        fetchUpcomingSeries.fulfilled,
        (state, action: PayloadAction<MediaItem[]>) => {
          state.isLoadingUpcomingSeries = false;
          state.upcomingSeries = action.payload;
        }
      )
      .addCase(fetchUpcomingSeries.rejected, (state, action) => {
        state.isLoadingUpcomingSeries = false;
        state.error = action.payload as AuthError;
      });
  },
});

// --- Exports ---
export const { clearHomepageError } = homepageSlice.actions;
export default homepageSlice.reducer;

// --- Selectors ---
export const selectHeroSliderItems = (state: RootState) =>
  state.homepage.heroSliderItems;
export const selectTrendingMovies = (state: RootState) =>
  state.homepage.trendingMovies;
export const selectRecommendedShows = (state: RootState) =>
  state.homepage.recommendedShows;
export const selectFeaturedItem = (state: RootState) =>
  state.homepage.featuredItem;
export const selectIsLoadingHero = (state: RootState) =>
  state.homepage.isLoadingHero;
export const selectIsLoadingTrendingMovies = (state: RootState) =>
  state.homepage.isLoadingTrendingMovies;
export const selectIsLoadingRecommendedShows = (state: RootState) =>
  state.homepage.isLoadingRecommendedShows;
export const selectIsLoadingFeatured = (state: RootState) =>
  state.homepage.isLoadingFeatured;
export const selectHomepageError = (state: RootState) => state.homepage.error;
export const selectTop10Movies = (state: RootState) =>
  state.homepage.top10Movies;
export const selectTop10Series = (state: RootState) =>
  state.homepage.top10Series;
export const selectIsLoadingTop10Movies = (state: RootState) =>
  state.homepage.isLoadingTop10Movies;
export const selectIsLoadingTop10Series = (state: RootState) =>
  state.homepage.isLoadingTop10Series;
export const selectUpcomingMovies = (state: { homepage: HomepageState }) =>
  state.homepage.upcomingMovies;
export const selectIsLoadingUpcomingMovies = (state: {
  homepage: HomepageState;
}) => state.homepage.isLoadingUpcomingMovies;

export const selectUpcomingSeries = (state: { homepage: HomepageState }) =>
  state.homepage.upcomingSeries;
export const selectIsLoadingUpcomingSeries = (state: {
  homepage: HomepageState;
}) => state.homepage.isLoadingUpcomingSeries;
