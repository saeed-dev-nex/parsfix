// client/src/types/index.ts

import { apiGet } from '@/lib/apiHelper';
import { createAsyncThunk } from '@reduxjs/toolkit';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}
export enum MovieStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  UPCOMING = 'UPCOMING',
}
export enum CreditType {
  ACTOR = 'ACTOR',
  DIRECTOR = 'DIRECTOR',
  WRITER = 'WRITER',
  PRODUCER = 'PRODUCER',
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  profilePictureUrl?: string | null;
  role: Role;
  isActivated?: boolean;
  dateOfBirth?: string | null;
  gender?: Gender | null;
}
export interface Genre {
  id: string;
  name: string;
  tmdbId: number;
  imageUrl?: string | null;
}

export interface Person {
  id: string;
  name: string;
  imageUrl?: string | null;
  tmdbId: number;
  biography?: string | null;
}

export interface MovieCredit {
  role: CreditType | string;
  characterName?: string | null;
  person: Person; // Use the Person interface
}
export interface SeriesCredit {
  role: CreditType | string;
  characterName?: string | null;
  person: Person; // Use the Person interface
}
// types for Movie List in Admin Panel
// matches with the MovieAdminList type in the backend
export interface MovieAdminList {
  id: string;
  title?: string | null;
  tmdbId: number;
  releaseDate?: string | null; // ISO String
  status?: MovieStatus | string;
  createdAt?: string; // ISO String
  imdbRating?: number | null;
  rottenTomatoesScore?: number | null;
  posterPath?: string | null; // Cloudinary URL for poster
  addedBy?: {
    // Data for the user who added the movie
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  _count?: {
    // counts for relations
    comments?: number;
    ratings?: number;
  };
}

// Types for Movie Details and Update in Admin Panel
export interface Movie extends MovieAdminList {
  originalTitle?: string | null;
  tagline?: string | null;
  description?: string | null;
  runtime?: number | null;
  originalLanguage?: string | null;
  popularity?: number | null;
  imdbId?: string | null;
  adult?: boolean | null;
  backdropPath?: string | null; // Cloudinary URL
  trailerUrl?: string | null;
  updatedAt?: string;
  genres?: { id: string; name: string }[];
  credits?: {
    role: string; // CreditType enum as string? or CreditType
    characterName?: string | null;
    person: { id: string; name: string; imageUrl?: string | null };
  }[];
}

export interface DashboardStats {
  moviesCount?: number;
  seriesCount?: number;
  genreCount?: number;
  personCount?: number;
  publishedMovieCount?: number;
  pendingMovieCount?: number; // depending user role
  userCountNormal?: number;
  // Only for super admin
  userCountAdmin?: number | null;
  userCountSuperAdmin?: number | null;
  userCountTotal?: number | null;
  // pendingSeriesCount?: number;
}
export interface RecentUserActivity {
  id: string;
  name?: string | null;
  email?: string | null;
  createdAt: string; // ISO Date String
}
export interface RecentMovieActivity {
  id: string;
  title?: string | null;
  createdAt: string; // ISO Date String
  status?: MovieStatus | string;
  addedBy?: {
    id: string;
    name?: string | null;
  } | null;
}
export interface RecentSeriesActivity {
  id: string;
  title?: string | null;
  createdAt: string; // ISO Date String
  status?: MovieStatus | string;
  addedBy?: {
    id: string;
    name?: string | null;
  } | null;
}
export interface RecentActivitiesResponse {
  recentUsers: RecentUserActivity[];
  recentMovies: RecentMovieActivity[];
  recentSeries: RecentSeriesActivity[];
}

export interface FetchMoviesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MoviesApiResponse {
  movies: MovieAdminList[];
  totalMovies: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface UpdateMoviePayload {
  movieId: string;
  updateData: Partial<
    Pick<
      Movie,
      | 'title'
      | 'originalTitle'
      | 'tagline'
      | 'description'
      | 'releaseDate'
      | 'runtime'
      | 'status'
      | 'originalLanguage'
      | 'popularity'
      | 'imdbId'
      | 'adult'
      | 'posterPath'
      | 'backdropPath'
      | 'trailerUrl'
      | 'imdbRating'
      | 'rottenTomatoesScore'
    >
  > & {
    // Relations Update add latter
    // genreIds?: string[];
  };
}
export interface CreateMoviePayload {
  tmdbId: number;
  status: MovieStatus | string;
}
export interface AuthError {
  message: string;
  code?: string; // Special cods like ACTIVATION_PENDING, ACTIVATION_RESENT
}
export interface FetchAdminUsersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  roleFilter?: Role | string | null;
  search?: string;
}
export interface AdminUsersApiResponse {
  users: User[]; // لیست کاربران (با فیلدهای انتخاب شده در سرور)
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  isLoading: boolean; // لودینگ کلی برای لیست
  isProcessing: boolean; // لودینگ برای عملیات block/unblock/delete
  error: AuthError | null;
  successMessage: string | null; // پیام موفقیت عملیات
}
export interface UserAdminState {
  users: User[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  isLoading: boolean; // لودینگ کلی برای لیست
  isProcessing: boolean; // لودینگ برای عملیات block/unblock/delete
  error: AuthError | null;
  successMessage: string | null; // پیام موفقیت عملیات
}
// -----------------------------------
export interface UpdateUserProfileData {
  name?: string;
  dateOfBirth?: string | null;
  gender?: Gender | null;
}
export interface UpdateUserProfilePayload {
  updateData: UpdateUserProfileData;
}
export interface UploadProfilePicturePayload {
  file: File;
}

// --- تایپ فصل (برای نمایش و مقدار اولیه فرم) ---
export interface Season {
  id: string;
  tmdbId?: number | null;
  seasonNumber: number;
  name?: string | null;
  overview?: string | null;
  airDate?: string | null; // ISO String date
  posterPath?: string | null; // Cloudinary URL
  episodeCount?: number | null;
  episodes?: Episode[]; // آرایه قسمت‌ها (برای نمایش در صفحه جزئیات)
}

// --- تایپ قسمت (برای نمایش) ---
export interface Episode {
  id: string;
  tmdbId?: number | null;
  episodeNumber: number;
  seasonNumber: number;
  title?: string | null;
  overview?: string | null;
  airDate?: string | null; // ISO String
  runtime?: number | null;
  stillPath?: string | null; // Cloudinary URL
}

// -------------Series Types -----------------
export enum SeriesStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  ENDED = 'ENDED',
  CANCELED = 'CANCELED',
  ARCHIVED = 'ARCHIVED',
  UPCOMING = 'UPCOMING',
} // وضعیت سریال
export interface Season {
  id: string;
  seasonNumber: number;
  episodeCount?: number | null;
  airDate?: string | null; // تاریخ پخش
  overview?: string | null; // توضیحات
  posterPath?: string | null; // آدرس تصویر
  episodes?: Episode[]; // لیست اپیزودها (در صورت نیاز)
  createdAt?: string; // تاریخ ایجاد
} // اضافه شود
export interface Episode {
  id: string;
  episodeNumber: number;
  title?: string | null; // عنوان اپیزود
  overview?: string | null; // توضیحات
  airDate?: string | null; // تاریخ پخش
  runtime?: number | null; // زمان اپیزود
  stillPath?: string | null; // آدرس تصویر
  createdAt?: string; // تاریخ ایجاد
  updatedAt?: string; // تاریخ ویرایش
} // اضافه شود

export interface SeriesAdminList {
  id: string;
  title?: string | null;
  tmdbId?: number | null;
  firstAirDate?: string | null;
  lastAirDate?: string | null;
  numberOfSeasons?: number | null;
  numberOfEpisodes?: number | null;
  status?: SeriesStatus | string;
  posterPath?: string | null;
  createdAt?: string;
  addedBy?: { id: string; name?: string | null; email?: string | null } | null;
}

export interface Series extends SeriesAdminList {
  // برای جزئیات و ویرایش
  originalTitle?: string | null;
  tagline?: string | null;
  description?: string | null;
  tmdbStatus?: string | null;
  type?: string | null;
  originalLanguage?: string | null;
  popularity?: number | null;
  homepage?: string | null;
  adult?: boolean | null;
  backdropPath?: string | null;
  updatedAt?: string;
  imdbRating?: number | null;
  rottenTomatoesScore?: number | null; // امتیازها
  genres?: Genre[];
  seasons?: Season[];
  credits?: SeriesCredit[];
}

export interface FetchSeriesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' /* filter?: any; */;
}
export interface SeriesApiResponse {
  series: SeriesAdminList[];
  totalSeries: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}
export interface FetchSeriesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' /* filter?: any; */;
}
export interface SeriesApiResponse {
  series: SeriesAdminList[];
  totalSeries: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface CreateSeriesPayload {
  tmdbId: number;
  status: SeriesStatus | string;
}

export interface UpdateSeriesPayload {
  seriesId: string;
  updateData: Partial<
    Pick<
      Series,
      | 'title'
      | 'originalTitle'
      | 'tagline'
      | 'description'
      | 'firstAirDate'
      | 'lastAirDate'
      | 'status'
      | 'tmdbStatus'
      | 'type'
      | 'originalLanguage'
      | 'popularity'
      | 'numberOfSeasons'
      | 'numberOfEpisodes'
      | 'homepage'
      | 'adult'
      | 'imdbRating'
      | 'rottenTomatoesScore'
    >
  > & {
    genreIds?: string[];
  };
}
// ------------------------------
// تایپ ساده برای نتایج جستجوی سریال TMDB
export interface TmdbSeriesSearchResult {
  id: number;
  name?: string; // نام برای سریال
  original_name?: string;
  first_air_date?: string; // تاریخ اولین پخش
  poster_path?: string;
}

// Modal input props
export interface AddSeriesModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; // برای رفرش لیست
}
// ---> Payloads جدید برای فصل
export interface UpdateSeasonData {
  // داده‌های ارسالی برای آپدیت فصل
  name?: string | null;
  overview?: string | null;
  airDate?: string | null; // فرمت YYYY-MM-DD یا ISO
}
export interface UpdateSeasonThunkPayload {
  seasonId: string;
  updateData: UpdateSeasonData;
}
export interface UploadSeasonPosterThunkPayload {
  seasonId: string;
  file: File;
}
export interface UpdateEpisodeData {
  // داده‌های ارسالی برای آپدیت اطلاعات پایه قسمت
  title?: string | null;
  overview?: string | null;
  airDate?: string | null; // فرمت YYYY-MM-DD یا ISO
  runtime?: number | null;
  // episodeNumber و seasonNumber معمولا آپدیت نمی‌شوند
}
export interface UpdateEpisodeThunkPayload {
  episodeId: string;
  updateData: UpdateEpisodeData;
}
export interface UploadEpisodeStillThunkPayload {
  episodeId: string;
  file: File;
}

// ------------ Public Home page ----------
export interface MediaItem {
  id: string;
  title: string;
  originalTitle?: string;
  description: string;
  posterPath: string; // URL به پوستر (برای کارت‌ها)
  backdropPath: string; // URL به عکس پس‌زمینه (برای اسلایدر و هدرها)
  genres: string[];
  rating?: string; // مثلا "8.5 IMDb" یا "4.5 Stars"
  duration?: string; // مثلا "2h 15m" یا "1 Season"
  releaseYear?: number;
  type: 'movie' | 'show';
  isNew?: boolean;
  ageRating?: string; // مثلا "18+" یا "PG-13"
  trailerUrl?: string;
  // برای اسلایدر اصلی Hero
  heroTitleImage?: string; // URL تصویر لوگو/عنوان فیلم برای هیرو
  heroSubtitle?: string;
  tagline?: string;
  rank?: number;

  image?: string;
  heroTagline?: string; // یک شعار یا توضیح کوتاه و جذاب
  qualityBadges?: string[]; // آرایه‌ای از نشان‌های کیفیت مثل ['HD', '5.1 Surround']
  imdbRating?: number;
  country?: string;
  views?: number;
}
export interface HomepageHeroItemsResponse {
  items: MediaItem[];
} // برای هیرو
export interface HomepageMediaListResponse {
  items: MediaItem[];
  nextPage?: number;
} // برای کاروسل‌ها

export interface HomepageState {
  heroSliderItems: MediaItem[];
  trendingMovies: MediaItem[];
  recommendedShows: MediaItem[];
  featuredItem: MediaItem | null; // برای بخش ویژه
  top10Movies: MediaItem[];
  top10Series: MediaItem[];
  upcomingMovies: MediaItem[];
  upcomingSeries: MediaItem[];

  isLoadingHero: boolean;
  isLoadingTrendingMovies: boolean;
  isLoadingRecommendedShows: boolean;
  isLoadingFeatured: boolean;
  isLoadingTop10Movies: boolean;
  isLoadingTop10Series: boolean;
  isLoadingUpcomingMovies: boolean;
  isLoadingUpcomingSeries: boolean;

  error: AuthError | null;
}

// ---------->> Types of public movies page <<----------
export interface MovieFilterOptions {
  genres: Genre[];
  years: number[];
  countries: string[];
  ageRatings: string[];
}

export interface FetchPublicMoviesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  genreId?: string | null;
  year?: number | null;
  minImdbRating?: number | null;
  country?: string | null;
  search?: string | null;
}

export interface PublicMoviesApiResponse {
  movies: MovieAdminList[];
  totalMovies: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}
