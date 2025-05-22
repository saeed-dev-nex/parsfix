// اصلاح یا ایجاد فایل مصنوعی برای نمایش اسلایدر
// هر فیلد جدید که به کامپوننت اضافه شده باید اینجا تعریف شود

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  backdropPath: string;
  posterPath: string; // برای تصاویر بندانگشتی
  heroTitleImage?: string;
  heroSubtitle?: string;
  isNew?: boolean;
  ageRating?: string;
  releaseYear?: number;
  duration?: string;
  imdbRating?: number; // امتیاز IMDB
  genres?: string[]; // ژانرهای فیلم
  country?: string; // کشور سازنده
  views?: number; // تعداد بازدیدها
  type?: 'movie' | 'show';
}

// مثال‌های نمونه
export const trendingItems: MediaItem[] = [
  {
    id: '1',
    title: 'فیلم اکشن نمونه',
    description:
      'این یک توضیح طولانی برای فیلم اکشن نمونه است. این متن برای نمایش در اسلایدر هیرو استفاده می‌شود.',
    backdropPath: 'https://wallpaperaccess.com/full/268352.jpg',
    posterPath:
      'https://www.movieposters.com/cdn/shop/products/spider-man-no-way-home_vgbsej5k_480x.progressive.jpg',
    heroTitleImage:
      'https://www.pngmart.com/files/22/Spider-Man-No-Way-Home-Logo-PNG-Transparent.png',
    heroSubtitle: 'ماجراجویی در دنیای چندگانه',
    isNew: true,
    ageRating: '+13',
    releaseYear: 2023,
    duration: '2h 5m',
    imdbRating: 8.7,
    genres: ['اکشن', 'ماجراجویی', 'علمی تخیلی'],
    country: 'ایالات متحده',
    views: 1250000,
    type: 'movie',
  },
  {
    id: '2',
    title: 'سریال درام نمونه',
    description:
      'این یک توضیح طولانی برای سریال درام نمونه است. توضیحات می‌تواند شامل خلاصه داستان و نکات مهم فیلم باشد.',
    backdropPath:
      'https://4kwallpapers.com/images/wallpapers/dune-part-two-2024-movies-3840x2160-13291.jpeg',
    posterPath:
      'https://www.movieposters.com/cdn/shop/products/dune_A_480x.progressive.jpg',
    heroSubtitle: 'سرنوشت یک سیاره',
    ageRating: '+15',
    releaseYear: 2024,
    duration: '2h 45m',
    imdbRating: 9.2,
    genres: ['علمی تخیلی', 'درام', 'ماجراجویی'],
    country: 'ایالات متحده',
    views: 2450000,
    type: 'movie',
  },
  {
    id: '3',
    title: 'انیمیشن خانوادگی',
    description:
      'این یک توضیح طولانی برای انیمیشن خانوادگی است. این انیمیشن مناسب برای تمام سنین طراحی شده است.',
    backdropPath: 'https://images6.alphacoders.com/132/1323564.jpeg',
    posterPath:
      'https://www.movieposters.com/cdn/shop/products/insideout2_480x.progressive.jpg',
    heroTitleImage:
      'https://1000logos.net/wp-content/uploads/2023/06/Inside-Out-2-Logo.png',
    ageRating: 'G',
    releaseYear: 2023,
    duration: '1h 45m',
    imdbRating: 8.4,
    genres: ['انیمیشن', 'خانوادگی', 'کمدی'],
    country: 'ایالات متحده',
    views: 3100000,
    type: 'movie',
  },
  {
    id: '4',
    title: 'مستند طبیعت',
    description:
      'این یک توضیح طولانی برای مستند طبیعت است. این مستند به بررسی زیبایی‌های طبیعت می‌پردازد.',
    backdropPath: 'https://wallpapercave.com/wp/wp13350802.jpg',
    posterPath:
      'https://m.media-amazon.com/images/I/71+VxWqZJOL._AC_UF1000,1000_QL80_.jpg',
    isNew: true,
    ageRating: 'G',
    releaseYear: 2022,
    duration: '1h 30m',
    imdbRating: 7.9,
    genres: ['مستند', 'طبیعت'],
    country: 'بریتانیا',
    views: 850000,
    type: 'show',
  },
  {
    id: '5',
    title: 'تریلر هیجان‌انگیز',
    description:
      'این یک توضیح طولانی برای تریلر هیجان‌انگیز است. این فیلم با صحنه‌های نفس‌گیر خود شما را میخکوب می‌کند.',
    backdropPath: 'https://wallpaperaccess.com/full/8264468.jpg',
    posterPath:
      'https://alternativemovieposters.com/wp-content/uploads/2022/05/Matt-Ferguson_TheBatman.jpg',
    heroTitleImage:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/The_Batman_%28film%29_logo.svg/1200px-The_Batman_%28film%29_logo.svg.png',
    ageRating: '+16',
    releaseYear: 2024,
    duration: '2h 15m',
    imdbRating: 8.2,
    genres: ['تریلر', 'معمایی', 'جنایی'],
    country: 'ایالات متحده',
    views: 1820000,
    type: 'movie',
  },
];

// برای سایر لیست‌ها استفاده کنید:
export const popularMovies: MediaItem[] = [...trendingItems];
export const newReleases: MediaItem[] = [...trendingItems];
