import { AuthError } from '@/store/slices/authSlice'; // یا مسیر صحیح تایپ خطای شما

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api/v1';

/**
 * رابط پایه برای آپشن‌های apiGet که شامل پارامترهای کوئری می‌شود
 */
interface ApiGetOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

/**
 * رابط پایه برای خطاهای API شامل جزئیات بیشتر
 */
interface ApiError extends Error {
  status?: number; // کد وضعیت HTTP
  data?: any; // داده‌های اضافی از پاسخ خطا (مثل {status, message, code})
  code?: string; // کد خطای سفارشی (مثل ACTIVATION_PENDING)
}

/**
 * تابع کمکی عمومی و پایه برای ارسال درخواست های fetch
 * @param {string} endpoint - مسیر endpoint به همراه query string احتمالی
 * @param {RequestInit} options - تنظیمات fetch (method, body, headers...)
 * @returns {Promise<any>} - پاسخ JSON از سرور
 * @throws {ApiError} - خطا در صورت بروز مشکل یا ناموفق بودن درخواست
 */
async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  // لاگ کردن درخواست قبل از ارسال
  console.log(
    `API Request: ${options.method || 'GET'} ${url}`,
    options.body ? '(Body exists)' : ''
  );

  try {
    const response = await fetch(url, {
      // هدرهای پیش‌فرض در توابع کمکی خاص (مثل apiPost) ست می‌شوند
      // تا برای FormData ست نشوند.
      credentials: 'include', // همیشه کوکی‌ها را بفرست
      ...options, // سایر آپشن‌ها (شامل method, body, headers از توابع کمکی)
    });

    // بررسی پاسخ - اگر موفق نبود
    if (!response.ok) {
      let errorData: any = {}; // مقدار پیش‌فرض
      try {
        // تلاش برای خواندن بدنه خطا به صورت JSON
        errorData = await response.json();
        console.log(`API Error Response (${response.status}):`, errorData);
      } catch (jsonError) {
        // اگر بدنه JSON نبود یا خطا در پارس رخ داد
        errorData.message =
          response.statusText || `HTTP error! Status: ${response.status}`;
        console.log(
          ` API Response Status: ${response.status}, Could not parse JSON body.`
        );
      }

      // ساخت آبجکت خطای استاندارد با اطلاعات اضافی
      const error: ApiError = new Error(
        errorData.message || `خطای ناشناخته با کد وضعیت ${response.status}`
      );
      error.status = response.status;
      error.data = errorData; // آبجکت کامل پاسخ خطا از سرور
      error.code = errorData.code; // استخراج کد خطای سفارشی اگر وجود داشت

      throw error; // پرتاب خطا برای مدیریت در thunk
    }

    // اگر پاسخ موفق بود اما محتوایی نداشت (مثل 204 No Content)
    if (response.status === 204) {
      console.log(`API Success Response (${response.status}): No Content`);
      return null; // یا مقدار مناسب دیگر
    }

    // خواندن بدنه پاسخ موفق به صورت JSON
    const data = await response.json();
    console.log(`API Success Response (${response.status}):`, data);
    return data;
  } catch (error) {
    // لاگ کردن خطای نهایی (چه از fetch چه از پردازش بالا)
    console.error('API Fetch Error:', error);
    // اطمینان از اینکه خطا همیشه ساختار مورد انتظار را دارد
    const typedError: ApiError = error as any;
    // پرتاب مجدد خطا برای مدیریت در لایه بالاتر (معمولا thunk)
    throw typedError;
  }
}

// --- توابع کمکی برای متدهای رایج ---

/**
 * ارسال درخواست GET (با پشتیبانی از query params)
 * @param endpoint مسیر API
 * @param options شامل آپشن‌های fetch و آپشن params برای کوئری استرینگ
 */
export const apiGet = (endpoint: string, options: ApiGetOptions = {}) => {
  let url = endpoint;
  if (options.params) {
    // حذف پارامترهای با مقدار null یا undefined
    const cleanedParams = Object.entries(options.params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>);

    const searchParams = new URLSearchParams(cleanedParams);
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    // حذف params از options تا به fetch پاس داده نشود
    delete options.params;
  }
  // apiFetch را با URL نهایی و آپشن‌های باقی‌مانده صدا بزن
  return apiFetch(url, { ...options, method: 'GET' });
};

/**
 * ارسال درخواست POST با بدنه JSON
 */
export const apiPost = (
  endpoint: string,
  body: any,
  options: RequestInit = {}
) => {
  return apiFetch(endpoint, {
    ...options,
    method: 'POST',
    headers: {
      // تعیین هدر مناسب برای JSON
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(body), // تبدیل بدنه به JSON
  });
};

/**
 * ارسال درخواست PUT با بدنه JSON
 */
export const apiPut = (
  endpoint: string,
  body: any,
  options: RequestInit = {}
) => {
  return apiFetch(endpoint, {
    ...options,
    method: 'PUT',
    headers: {
      // تعیین هدر مناسب برای JSON
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(body),
  });
};

/**
 * ارسال درخواست DELETE (معمولا بدنه ندارد)
 */
export const apiDelete = (endpoint: string, options: RequestInit = {}) => {
  return apiFetch(endpoint, { ...options, method: 'DELETE' });
};

/**
 * ارسال درخواست PUT با بدنه FormData (برای آپلود فایل)
 */
export async function apiPutFormData(
  endpoint: string,
  formData: FormData,
  options: RequestInit = {}
) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`API FormData Request: PUT ${url}`);
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        // Content-Type را **ست نکنید**، مرورگر خودش با boundary صحیح ست می‌کند
        Accept: 'application/json', // انتظار پاسخ JSON
        ...options.headers,
      },
      body: formData, // ارسال آبجکت FormData
      credentials: 'include',
      ...options,
    });

    // مدیریت خطا (مشابه apiFetch)
    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        errorData.message = response.statusText;
      }
      const error: ApiError = new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
      error.status = response.status;
      error.data = errorData;
      error.code = errorData.code;
      throw error;
    }
    if (response.status === 204) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API PUT FormData Error:', error);
    const typedError: ApiError = error as any;
    throw typedError;
  }
}

// می‌توانید تابع مشابه apiPostFormData هم در صورت نیاز اضافه کنید
