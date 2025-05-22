import axios from 'axios';
import AppError from '../../utils/AppError.js';
import 'dotenv/config';

const tmdbApiKey = process.env.TMDB_API_KEY;
const tmdbBaseUrl = 'https://api.themoviedb.org/3';

if (!tmdbApiKey) {
  console.warn(
    'TMDB_API_KEY is not set in the environment variables. Please set it to use TMDB API.'
  );
}

const tmdbApi = axios.create({
  baseURL: tmdbBaseUrl,
  params: {
    api_key: tmdbApiKey,
    language: 'fa-IR',
  },
});
/**
 * Get movie details from TMDB API
 * @param {number} tmdbId
 * @returns {Promise<Object>} Movie details
 */

export const getTmdbMovieDetails = async (tmdbId) => {
  if (!tmdbApiKey) throw new Error('TMDB API Key not configured.');
  try {
    console.log(`Fetching TMDB details for ID: ${tmdbId}`);
    const response = await tmdbApi.get(`/movie/${tmdbId}`, {
      params: {
        append_to_response: 'credits,videos,images', // دریافت عوامل، ویدئوها و تصاویر اضافی
        include_image_language: 'en,null', // سعی کن عکس انگلیسی یا بدون زبان را هم بگیری
      },
    });
    console.log(`Successfully fetched TMDB details for ID: ${tmdbId}`);
    return response.data; // شامل details, credits, videos, images
  } catch (error) {
    console.error(
      `Error fetching TMDB details for ID ${tmdbId}:`,
      error.response?.data || error.message
    );
    if (error.response?.status === 404) {
      throw new Error(`فیلمی با شناسه TMDB ${tmdbId} یافت نشد.`); // یا خطای 404
    }
    throw new Error('خطا در دریافت اطلاعات از سرویس TMDB.'); // یا خطای 500/502
  }
};

/**
 * Get movie By Name from TMDB API
 * @param {string} query
 * @param {number} page
 * @returns {Promise<Object>} Movie credits
 */
export const searchTmdbMovies = async (query, page = 1) => {
  if (!tmdbApiKey) throw new Error('TMDB API Key not configured.');
  if (!query || query.trim() === '') {
    AppError('عبارت جستجو نمی تواند خالی باشد!', 400);
  }
  try {
    console.log(`Searching TMDB for query: "${query}", page: ${page}`);
    const response = await tmdbApi.get('/search/movie', {
      params: {
        query: query.trim(), // حذف فاصله های اضافی
        page: page,
        include_adult: false, // برای جلوگیری از نتایج بزرگسال
      },
    });
    console.log(
      `Found <span class="math-inline">\{response\.data?\.total\_results \|\| 0\} results for "</span>{query}"`
    );
    const filteredResults = response.data.results.map((movie) => ({
      id: movie.id, // TMDB ID
      title: movie.title,
      original_title: movie.original_title,
      release_date: movie.release_date, // فرمت YYYY-MM-DD
      poster_path: movie.poster_path, // فقط مسیر، نه URL کامل
    }));
    return {
      page: response.data.page,
      results: filteredResults,
      total_pages: response.data.total_pages,
      total_results: response.data.total_results,
    };
  } catch (error) {
    console.error(
      `Error searching TMDB for query "${query}":`,
      error.response?.data || error.message
    );
    AppError('خطا در جستجوی فیلم در سرویس TMDB.', 500);
  }
};
// -------------- fetch series details --------------
/**
 * Get series details from TMDB API
 * @param {string} query
 * @param {number} pge
 * @returns {Promise<Object>} Series details
 */
export const searchTmdbSeries = async (query, page = 1) => {
  if (!tmdbApiKey) throw new Error('TMDB API Key not configured.');
  if (!query || query.trim() === '') {
    AppError('عبارت جستجو نمی تواند خالی باشد!', 400);
  }
  try {
    console.log(`Searching TMDB for query: "${query}", page: ${page}`);
    const response = await tmdbApi.get('/search/tv', {
      params: {
        query: query.trim(), // حذف فاصله های اضافی
        page: page,
        include_adult: false, // برای جلوگیری از نتایج بزرگسال
      },
    });
    console.log(
      `Found <span class="math-inline">\{response\.data?\.total\_results \|\| 0\} results for "</span>{query}"`
    );
    const filteredResults = response.data.results.map((series) => ({
      id: series.id, // TMDB ID
      name: series.name,
      original_name: series.original_name,
      first_air_date: series.first_air_date, // فرمت YYYY-MM-DD
      poster_path: series.poster_path, // فقط مسیر، نه URL کامل
    }));
    return {
      page: response.data.page,
      results: filteredResults,
      total_pages: response.data.total_pages,
      total_results: response.data.total_results,
    };
  } catch (error) {
    console.error(
      `Error searching TMDB for query "${query}":`,
      error.response?.data || error.message
    );
    AppError('خطا در جستجوی سریال در سرویس TMDB.', 500);
  }
};

/**
 * Get series details from TMDB API
 * @param {number} tmdbId
 * @returns {Promise<Object>} Series details
 * @throws {AppError} If TMDB ID is invalid or not found
 */

export const getTmdbSeriesDetails = async (tmdbId) => {
  if (!tmdbApiKey) throw new AppError('TMDB API Key not configured.', 500);
  if (!tmdbId || isNaN(tmdbId)) {
    throw new AppError('شناسه TMDB نامعتبر است.', 400);
  }
  try {
    console.log(`Workspace TMDB Series details for ID: ${tmdbId}`);
    const response = await tmdbApi.get(`/tv/${tmdbId}`, {
      params: {
        append_to_response: 'credits,videos,images', // دریافت عوامل، ویدئوها و تصاویر اضافی
        include_image_language: 'en,null', // سعی کن عکس انگلیسی یا بدون زبان را هم بگیری
      },
    });
    console.log(`Successfully fetched TMDB series details for ID: ${tmdbId}`);
    return response.data; // شامل details, credits, videos, images
  } catch (error) {
    console.error(
      `Error fetching TMDB series details for ID ${tmdbId}:`,
      error.response?.data || error.message
    );
    if (error.response?.status === 404) {
      throw new AppError(`سریالی با شناسه TMDB ${tmdbId} یافت نشد.`, 404);
    }
    throw new AppError('خطا در دریافت اطلاعات از سرویس TMDB.', 500);
  }
};

/**
 * Get details of a specific season from a series (including episode list) from TMDB
 * @param {number} seriesTmdbId - TMDB series ID
 * @param {number} seasonNumber - Season number (e.g. 1, 2, ...)
 * @returns {Promise<object>} - Season information object including episodes array
 * @throws {AppError} - If an error occurs
 */
export const getTmdbSeasonDetails = async (seriesTmdbId, seasonNumber) => {
  // 1. Check API key existence
  if (!tmdbApiKey) {
    throw new AppError('TMDB API Key not configured.', 500); // خطای سرور
  }
  // 2. Validate inputs
  if (
    seriesTmdbId === undefined ||
    seriesTmdbId === null ||
    isNaN(seriesTmdbId) ||
    seriesTmdbId <= 0
  ) {
    throw new AppError('شناسه سریال TMDB نامعتبر است.', 400); // خطای کلاینت
  }
  if (
    seasonNumber === undefined ||
    seasonNumber === null ||
    isNaN(seasonNumber) ||
    seasonNumber < 0
  ) {
    // Season 0 is usually for Specials
    throw new AppError('شماره فصل نامعتبر است.', 400);
  }

  try {
    console.log(
      `Workspaceing TMDB season details for Series ID: ${seriesTmdbId}, Season: ${seasonNumber}`
    );
    // 3. Send request to TMDB series season endpoint
    const response = await tmdbApi.get(
      `/tv/${seriesTmdbId}/season/${seasonNumber}`,
      {
        params: {
          // language is in default axios settings
          // append_to_response=images if you want season images too
        },
      }
    );
    console.log(
      `Successfully fetched TMDB season ${seasonNumber} details for Series ID: ${seriesTmdbId}`
    );

    // 4. Return response data
    // response.data includes fields like: id, air_date, episodes (array), name, overview, poster_path, season_number
    return response.data;
  } catch (error) {
    // 5. Error handling
    console.error(
      `Error fetching TMDB season details for Series ID ${seriesTmdbId}, Season ${seasonNumber}:`,
      error.response?.data || error.message
    );
    if (error.response?.status === 404) {
      throw new AppError(
        `فصل ${seasonNumber} برای سریال با شناسه TMDB ${seriesTmdbId} یافت نشد.`,
        404
      );
    }
    // Other TMDB or network errors
    throw new AppError('خطا در دریافت اطلاعات فصل سریال از سرویس TMDB.', 502); // Bad Gateway
  }
};
