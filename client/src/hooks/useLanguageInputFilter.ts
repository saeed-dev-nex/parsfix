import React, { useCallback } from "react";

// Regex برای کاراکترهای مجاز
// انگلیسی: حروف کوچک و بزرگ، اعداد و علائم رایج ایمیل/پسورد. در صورت نیاز علائم بیشتری اضافه کنید.
const englishRegex = /[^a-zA-Z0-9@.\-_!#$%&'*+/=?^`{|}~]/g;
// فارسی: رنج اصلی حروف فارسی/عربی، فاصله و نیم‌فاصله. ممکن است نیاز به تنظیم دقیق‌تر باشد.
// \u0600-\u06FF شامل حروف فارسی، عربی، و علائم اعراب است.
// \s فاصله معمولی را مجاز می‌کند.
// \u200C کاراکتر Zero-width non-joiner یا نیم‌فاصله است.
const persianRegex = /[^\u0600-\u06FF\s\u200C]/g;

type Language = "en" | "fa";

interface UseLanguageInputFilterOptions {
  language: Language;
  setValue: (value: string) => void; // تابعی که state را آپدیت می‌کند
}

export const useLanguageInputFilter = ({
  language,
  setValue,
}: UseLanguageInputFilterOptions) => {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      let filteredValue = rawValue;

      // اعمال فیلتر بر اساس زبان انتخاب شده
      if (language === "en") {
        filteredValue = rawValue.replace(englishRegex, "");
      } else if (language === "fa") {
        filteredValue = rawValue.replace(persianRegex, "");
      }

      // به‌روزرسانی state والد تنها با مقدار فیلتر شده
      // این کار از نمایش کاراکترهای نامجاز جلوگیری می‌کند
      setValue(filteredValue);

      // نکته: ممکن است در موارد پیچیده، تغییر مستقیم event.target.value باعث پرش نشانگر شود.
      // به‌روزرسانی state معمولاً کافی است، چون مقدار TextField از state خوانده می‌شود.
      // event.target.value = filteredValue; // معمولاً نیازی نیست
    },
    [language, setValue]
  );

  // برگرداندن تابع onChange برای استفاده در کامپوننت
  return { onChange: handleChange };
};
