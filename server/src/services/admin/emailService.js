import nodemailer from 'nodemailer';
import 'dotenv/config';
import { activeCodeEmailTemplate } from '../../utils/activeCodeEmailTemplate.js';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * @param {string} to - Email address of the recipient
 * @param {string} subject - Subject of the email
 * @param {string} html - HTML content of the email
 */

export const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error(
      'Email configuration is missing. Please check your environment variables.'
    );
    if (process.env.NODE_ENV !== 'production') {
      console.log('---------- EMAIL SIMULATION ----------');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`HTML Body: ${html}`);
      console.log('---------- END EMAIL SIMULATION ----------');
      return;
    } else {
      throw new Error('Email sending is not configured for production.');
    }
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('خطا در ارسال ایمیل فعال‌سازی.');
  }
};

/**
 * تابع ارسال ایمیل فعال‌سازی حساب کاربری
 * @param {string} userEmail - ایمیل کاربر
 * @param {string} activationToken - توکن فعال‌سازی
 */

export async function sendActivationEmail(userEmail, activationToken) {
  const subject = 'کد فعالسازی حساب کاربری';
  const html = activeCodeEmailTemplate(activationToken);
  await sendEmail(userEmail, subject, html);
}
