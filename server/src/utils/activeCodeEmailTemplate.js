export const activeCodeEmailTemplate = (code) => {
  return `
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>کد فعال‌سازی پارس‌فلیکس</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Tahoma, Arial, sans-serif; background-color: #141414;">
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #1f1f1f; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 20px; text-align: center;">
              <!-- Logo -->
              <h1 style="margin: 0; font-size: 32px; font-weight: 900; background: linear-gradient(90deg, #e50914, #ff5f6d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 2px 10px rgba(229, 9, 20, 0.3);">
                PARSFLIX
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <div style="text-align: center; padding: 30px 0;">
                <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 20px;">کد فعال‌سازی حساب کاربری</h2>
                <p style="color: #b3b3b3; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                  برای تکمیل ثبت‌نام و فعال‌سازی حساب کاربری خود، لطفاً کد زیر را وارد کنید:
                </p>
                <div style="background: rgba(229, 9, 20, 0.1); border: 2px solid #e50914; border-radius: 8px; padding: 20px; margin: 0 auto; max-width: 300px;">
                  <p style="color: #e50914; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0;">
                    ${code}
                  </p>
                </div>
                <p style="color: #b3b3b3; font-size: 14px; margin: 30px 0 0;">
                  این کد تا 15 دقیقه دیگر معتبر است.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #181818;">
              <p style="color: #737373; font-size: 12px; text-align: center; margin: 0;">
                اگر شما درخواست ایجاد حساب کاربری نداده‌اید، لطفاً این ایمیل را نادیده بگیرید.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};
