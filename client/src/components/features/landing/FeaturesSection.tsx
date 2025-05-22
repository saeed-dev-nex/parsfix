"use client";
import {
  Box,
  Container,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles"; // alpha را برای شفافیت اضافه می‌کنیم
import DevicesIcon from "@mui/icons-material/Devices";
import DownloadIcon from "@mui/icons-material/Download";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import HighQualityIcon from "@mui/icons-material/HighQuality";

// کامپوننت کارت ویژگی‌ها با قابلیت هاور - هماهنگ با تم
const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  textAlign: "center",
  transition: "all 0.3s ease-in-out",
  // استفاده از رنگ پس‌زمینه کاغذ از تم، شاید با کمی تغییر یا گرادینت ملایم بر اساس تم
  background: `linear-gradient(145deg, ${alpha(
    theme.palette.background.paper,
    0.9
  )} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
  // background: theme.palette.background.paper, // یا فقط رنگ پس‌زمینه کاغذ
  borderRadius: "16px", // این مقدار می‌تواند در theme.shape.borderRadius هم تعریف شود
  // استفاده از رنگ divider تم برای بوردر
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[5], // استفاده از سایه‌های تعریف شده در تم (می‌توانید اندیس را تغییر دهید)
  overflow: "hidden",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%", // برای انیمیشن هاور از چپ به راست
    width: "100%",
    height: "4px",
    // استفاده از رنگ‌های تم (مثلا warning یا primary/secondary) برای گرادینت
    background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
    // background: `linear-gradient(90deg, ${theme.palette.warning.dark}, ${theme.palette.warning.light}, ${theme.palette.warning.dark})`, // جایگزین طلایی؟
    transition: "all 0.5s ease-in-out",
  },
  "&:hover": {
    transform: "translateY(-10px)",
    boxShadow: theme.shadows[10], // سایه قوی‌تر در هاور
    "&::before": {
      left: 0, // نمایش گرادینت در هاور
    },
    "& .MuiSvgIcon-root": {
      transform: "scale(1.1) rotate(5deg)",
      // استفاده از رنگ اصلی تم برای آیکون در هاور
      color: theme.palette.primary.main,
    },
  },
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

// آیکون های استایل شده - هماهنگ با تم
const FeatureIcon = styled(Box)(({ theme }) => ({
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: theme.spacing(3),
  // استفاده از رنگ پس‌زمینه با شفافیت بر اساس تم
  background: `linear-gradient(145deg, ${alpha(
    theme.palette.background.default,
    0.6
  )} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
  boxShadow: theme.shadows[3],
  "& .MuiSvgIcon-root": {
    fontSize: "40px",
    // استفاده از رنگ ثانویه تم برای آیکون (یا رنگ دیگر بر اساس طراحی)
    color: theme.palette.secondary.main, // یا theme.palette.primary.main
    transition: "all 0.3s ease-in-out",
  },
  [theme.breakpoints.down("sm")]: {
    width: "60px",
    height: "60px",
    marginBottom: theme.spacing(2),
    "& .MuiSvgIcon-root": {
      fontSize: "30px",
    },
  },
}));

// عنوان بخش با استایل خاص - هماهنگ با تم
const CustomSectionTitle = styled(Box)(({ theme }) => ({
  position: "relative",
  marginBottom: theme.spacing(8),
  paddingBottom: theme.spacing(2),
  textAlign: "center",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "60px",
    height: "3px",
    // استفاده از رنگ‌های اصلی و ثانویه تم برای گرادینت زیر خط
    background: `linear-gradient(to right, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
    transition: "width 0.3s ease-in-out",
  },
  "&:hover::after": {
    width: "120px",
  },
  [theme.breakpoints.down("md")]: {
    marginBottom: theme.spacing(5),
  },
}));

// داده های ویژگی‌ها (بدون تغییر)
const features = [
  {
    id: 1,
    title: "تماشا در همه دستگاه‌ها",
    description:
      "فیلم‌ها و سریال‌های مورد علاقه خود را در تلویزیون، رایانه، تبلت، گوشی هوشمند و سایر دستگاه‌ها تماشا کنید.",
    icon: <DevicesIcon />,
  },

  {
    id: 2,
    title: "دانلود و تماشای آفلاین",
    description:
      "محتوای مورد علاقه خود را دانلود کنید و بدون نیاز به اینترنت در هر کجا که هستید تماشا کنید.",
    icon: <DownloadIcon />,
  },

  {
    id: 3,
    title: "مناسب برای کودکان",
    description:
      "پروفایل مخصوص کودکان را راه‌اندازی کنید تا محتوای مناسب سن آن‌ها را به صورت امن تماشا کنند.",
    icon: <ChildCareIcon />,
  },

  {
    id: 4,
    title: "کیفیت تصویر فوق‌العاده",
    description:
      "فیلم‌ها و سریال‌ها را با کیفیت HD و فورکی با وضوح بالا تماشا کنید و از جزئیات بیشتری لذت ببرید.",
    icon: <HighQualityIcon />,
  },
];

const FeaturesSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // از isTablet و isDesktop استفاده نشده بود، حذف یا استفاده کنید.

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10, lg: 12 },
        // استفاده از رنگ پس‌زمینه پیش‌فرض تم یا گرادینت ملایم بر اساس آن
        // background: theme.palette.background.default,
        background: `linear-gradient(to bottom, ${
          theme.palette.background.default
        } 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* پترن زمینه - استفاده از رنگ‌های تم با شفافیت */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // مثال: استفاده از رنگ اولیه و ثانویه تم برای پترن
          backgroundImage: `radial-gradient(circle at 25% 25%, ${alpha(
            theme.palette.primary.dark,
            0.05
          )} 0%, transparent 10%), radial-gradient(circle at 75% 75%, ${alpha(
            theme.palette.secondary.dark,
            0.05
          )} 0%, transparent 10%)`,
          backgroundSize: "40px 40px",
          opacity: 0.5,
          zIndex: 0,
        }}
      />

      <Container maxWidth='lg' sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 6 }}>
          <CustomSectionTitle>
            <Typography
              variant={isMobile ? "h4" : "h3"}
              component='h2'
              sx={{
                fontWeight: 900, // وزن فونت می‌تواند از تم بیاید theme.typography.h3.fontWeight
                // استفاده از رنگ متن اصلی تم
                color: "text.primary",
              }}
            >
              چرا پارس‌فلیکس را انتخاب کنید؟
            </Typography>
          </CustomSectionTitle>
        </Box>

        {/* نمایش کارت‌ها برای دسکتاپ */}
        <Box
          sx={{
            display: { xs: "none", lg: "flex" },
            flexDirection: "row",
            gap: 4,
            alignItems: "stretch",
            mb: 4,
          }}
        >
          {features.map((feature) => (
            <Box key={feature.id} sx={{ flex: 1 }}>
              <FeatureCard elevation={5}>
                {" "}
                {/* elevation می‌تواند مقداری از theme.shadows باشد */}
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <Typography
                  variant='h5'
                  component='h3'
                  gutterBottom
                  sx={{
                    fontWeight: "bold", // یا theme.typography.h5.fontWeight
                    // استفاده از رنگ متن اصلی تم
                    color: "text.primary",
                    marginBottom: 2,
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    // استفاده از رنگ متن ثانویه تم
                    color: "text.secondary",
                    fontSize: "0.95rem", // می‌تواند از theme.typography.body2.fontSize بیاید
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </Typography>
              </FeatureCard>
            </Box>
          ))}
        </Box>

        {/* نمایش کارت‌ها برای تبلت و موبایل (دو ردیف) */}
        {/* ردیف اول */}
        <Box
          sx={{
            display: { xs: "flex", lg: "none" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 3,
            alignItems: "stretch",
            mb: 3,
          }}
        >
          {features.slice(0, 2).map((feature) => (
            <Box key={feature.id} sx={{ flex: 1 }}>
              <FeatureCard elevation={5}>
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  component='h3'
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "text.primary", mb: 2 }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: "text.secondary",
                    fontSize: { xs: "0.85rem", md: "0.95rem" },
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </Typography>
              </FeatureCard>
            </Box>
          ))}
        </Box>
        {/* ردیف دوم */}
        <Box
          sx={{
            display: { xs: "flex", lg: "none" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 3,
            alignItems: "stretch",
          }}
        >
          {features.slice(2, 4).map((feature) => (
            <Box key={feature.id} sx={{ flex: 1 }}>
              <FeatureCard elevation={5}>
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  component='h3'
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "text.primary", mb: 2 }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: "text.secondary",
                    fontSize: { xs: "0.85rem", md: "0.95rem" },
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </Typography>
              </FeatureCard>
            </Box>
          ))}
        </Box>

        {/* نقطه‌های تزئینی - استفاده از رنگ‌های تم با شفافیت */}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            left: "5%",
            width: "200px",
            height: "200px",
            // مثال: استفاده از رنگ اولیه تم
            background: `radial-gradient(circle, ${alpha(
              theme.palette.primary.main,
              0.05
            )} 0%, transparent 70%)`,
            borderRadius: "50%",
            zIndex: 0,
            display: { xs: "none", lg: "block" },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "15%",
            right: "8%",
            width: "150px",
            height: "150px",
            // مثال: استفاده از رنگ ثانویه تم
            background: `radial-gradient(circle, ${alpha(
              theme.palette.secondary.main,
              0.05
            )} 0%, transparent 70%)`,
            borderRadius: "50%",
            zIndex: 0,
            display: { xs: "none", lg: "block" },
          }}
        />
      </Container>
    </Box>
  );
};

export default FeaturesSection;
