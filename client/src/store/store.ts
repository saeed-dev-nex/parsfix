import { configureStore } from '@reduxjs/toolkit';
import moviesReducer from './slices/movieSlice'; // Import your movies slice
import authReducer from './slices/authSlice'; // Import your auth slice
import dashboardReducer from './slices/dashboardSlice'; // Import your dashboard slice
import userAdminReducer from './slices/userAdminSlice'; // برای مدیریت کاربران ادمین
import profileReducer from './slices/profileSlice';
import seriesReducer from './slices/seriesSlice'; // برای مدیریت سریال‌ها
import seasonAdminReducer from './slices/seasonSlice';
import episodeAdminReducer from './slices/episodeSlice';
import homepageReducer from './slices/homepageSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: moviesReducer,
    dashboard: dashboardReducer,
    userAdmin: userAdminReducer,
    profile: profileReducer,
    seriesAdmin: seriesReducer, // برای مدیریت سریال‌ها
    seasonAdmin: seasonAdminReducer,
    episodeAdmin: episodeAdminReducer,
    homepage: homepageReducer,
  },

  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
