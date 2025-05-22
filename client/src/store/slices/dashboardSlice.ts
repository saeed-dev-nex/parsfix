import { apiGet } from '@/lib/apiHelper';
import {
  AuthError,
  DashboardStats,
  RecentActivitiesResponse,
  RecentMovieActivity,
  RecentSeriesActivity,
  RecentUserActivity,
} from '@/types';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// --- State ---
interface DashboardState {
  stats: DashboardStats | null;
  recentUsers: RecentUserActivity[];
  recentMovies: RecentMovieActivity[];
  recentSeries: RecentSeriesActivity[];
  isLoadingStats: boolean;
  isLoadingActivities: boolean;
  error: AuthError | null;
}

const initialState: DashboardState = {
  stats: null,
  recentUsers: [],
  recentMovies: [],
  recentSeries: [],
  isLoadingStats: false,
  isLoadingActivities: false,
  error: null,
};
// --- Thunks ---
export const fetchDashboardStats = createAsyncThunk<DashboardStats>(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const responseData = await apiGet('/admin/stats');
      console.log('🚀 ~ fetchDashboardStats ~ responseData:', responseData);

      if (responseData.status === 'success' && responseData?.data?.stats) {
        return responseData.data.stats as DashboardStats;
      } else {
        throw new Error(responseData.message || 'ساختار پاسخ نامعتبر است');
      }
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'خطا در واکشی آمار داشبورد',
      } as AuthError);
    }
  }
);
export const fetchRecentActivities = createAsyncThunk<RecentActivitiesResponse>(
  'dashboard/fetchActivities',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🚀 ~ fetchRecentActivities ~ called');

      const responseData = await apiGet('/admin/recent-activities');
      console.log('🚀 ~ fetchRecentActivities ~ responseData:', responseData);
      if (responseData?.status === 'success' && responseData?.data) {
        // اطمینان از وجود آرایه‌ها حتی اگر خالی باشند
        return {
          recentUsers: responseData.data.recentUsers || [],
          recentMovies: responseData.data.recentMovies || [],
          recentSeries: responseData.data.recentSeries || [],
        } as RecentActivitiesResponse;
      } else {
        throw new Error(
          responseData?.message || 'ساختار پاسخ فعالیت‌های اخیر نامعتبر است'
        );
      }
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'خطا در واکشی فعالیت‌های اخیر',
      } as AuthError);
    }
  }
);
// --- Slice ---
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoadingStats = true;
        state.error = null;
      })
      .addCase(
        fetchDashboardStats.fulfilled,
        (state, action: PayloadAction<DashboardStats>) => {
          state.isLoadingStats = false;
          state.stats = action.payload;
        }
      )
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.error = action.payload as AuthError;
        state.stats = null;
      })
      // Activities
      .addCase(fetchRecentActivities.pending, (state) => {
        state.isLoadingActivities = true;
        state.error = null;
      })
      .addCase(
        fetchRecentActivities.fulfilled,
        (state, action: PayloadAction<RecentActivitiesResponse>) => {
          state.isLoadingActivities = false;
          state.recentUsers = action.payload.recentUsers;
          state.recentMovies = action.payload.recentMovies;
          state.recentSeries = action.payload.recentSeries;
        }
      )
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.isLoadingActivities = false;
        state.error = action.payload as AuthError;
        state.recentUsers = [];
        state.recentMovies = [];
      });
  },
});

// --- Exports ---
export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

// --- Selectors ---
export const selectDashboardStats = (state: RootState) => state.dashboard.stats;
export const selectRecentUsers = (state: RootState) =>
  state.dashboard.recentUsers;
export const selectRecentMovies = (state: RootState) =>
  state.dashboard.recentMovies;
export const selectRecentSeries = (state: RootState) =>
  state.dashboard.recentSeries;
export const selectDashboardIsLoadingStats = (state: RootState) =>
  state.dashboard.isLoadingStats;
export const selectDashboardIsLoadingActivities = (state: RootState) =>
  state.dashboard.isLoadingActivities;
export const selectDashboardError = (state: RootState) => state.dashboard.error;
