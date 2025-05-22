import {
  Category,
  Comment,
  Dashboard,
  Lightbulb,
  Movie,
  People,
  Settings,
  Tv,
} from "@mui/icons-material";
export const menuItems = [
  { text: "داشبورد", icon: <Dashboard />, path: "/admin" },
  { text: "مدیریت فیلم‌ها", icon: <Movie />, path: "/admin/movies" },
  { text: "مدیریت سریال‌ها", icon: <Tv />, path: "/admin/series" },
  { text: "مدیریت بازیگران", icon: <People />, path: "/admin/actors" },
  { text: "مدیریت کارگردانان", icon: <People />, path: "/admin/directors" }, // آیکن مشابه
  { text: "مدیریت ژانرها", icon: <Category />, path: "/admin/genres" },
  { text: "مدیریت کاربران", icon: <People />, path: "/admin/users" },
  { text: "مدیریت نظرات", icon: <Comment />, path: "/admin/comments" },
  {
    text: "پیشنهادات کاربران",
    icon: <Lightbulb />,
    path: "/admin/suggestions",
  },
  { text: "تنظیمات سایت", icon: <Settings />, path: "/admin/settings" },
];
