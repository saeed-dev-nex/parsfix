"use client";
import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
  styled,
  alpha,
} from "@mui/material";
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // استفاده نشده بود
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";

// استایل بخش عنوان - هماهنگ با تم (فرض می‌کنیم مشابه قبل است یا ویرایش شده)
// نکته: گرادینت‌های این بخش باید با رنگ‌های تم جایگزین شوند
const CustomSectionTitle = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: theme.spacing(6),
  position: "relative",
  textAlign: "center",
  "&::before": {
    // خط اول زیر عنوان
    content: '""',
    position: "absolute",
    bottom: -8,
    width: "60px",
    height: "4px",
    // استفاده از رنگ‌های تم، مثلا secondary و primary
    background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
    borderRadius: "2px",
  },
  "&::after": {
    // خط دوم زیر عنوان
    content: '""',
    position: "absolute",
    bottom: -8,
    width: "30px",
    height: "4px",
    // استفاده از رنگ‌های تم، مثلا primary و یک رنگ تیره‌تر یا مکمل
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${
      theme.palette.secondary.dark || theme.palette.primary.dark
    } 100%)`,
    borderRadius: "2px",
    transform: "translateX(65px)", // این مقدار ممکن است نیاز به تنظیم داشته باشد
  },
}));

// استایل‌های آکاردئون - هماهنگ با تم
const StyledAccordion = styled(Accordion)(({ theme }) => ({
  // استفاده از رنگ پس‌زمینه کاغذ تم با شفافیت
  backgroundColor: alpha(theme.palette.background.paper, 0.7), // تنظیم شفافیت بر اساس نیاز
  backdropFilter: "blur(10px)", // این افکت باقی می‌ماند
  borderRadius: "12px", // یا theme.shape.borderRadius * 1.5
  marginBottom: theme.spacing(2.5),
  // استفاده از رنگ divider تم برای بوردر
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[3], // استفاده از سایه تم
  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  overflow: "hidden",
  "&:hover": {
    boxShadow: theme.shadows[6], // سایه قوی‌تر در هاور
    transform: "translateY(-4px)",
    // استفاده از رنگ primary تم با شفافیت برای بوردر هاور
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
  "&.Mui-expanded": {
    margin: theme.spacing(0, 0, 2.5, 0),
    transform: "translateY(-2px)",
    // استفاده از رنگ primary تم با شفافیت بیشتر برای بوردر باز شده
    borderColor: alpha(theme.palette.primary.main, 0.4),
    // شاید بخواهید پس‌زمینه کمی متفاوت باشد وقتی باز است
    // backgroundColor: alpha(theme.palette.background.paper, 0.8),
  },
  "&::before": {
    // حذف خط جداکننده پیش‌فرض آکاردئون
    display: "none",
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  "& .MuiAccordionSummary-content": {
    margin: "16px 0", // تنظیم مارجین محتوای داخلی
  },
  "&.Mui-expanded": {
    // بوردر پایین وقتی آکاردئون باز است
    borderBottom: `1px solid ${theme.palette.divider}`, // استفاده از divider تم
  },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(3, 3.5),
  // پس‌زمینه ملایم‌تر برای بخش جزئیات، بر اساس رنگ پس‌زمینه پیش‌فرض
  backgroundColor: alpha(theme.palette.background.default, 0.3),
  // borderTop: `1px solid ${theme.palette.divider}`, // اگر بوردر بالا لازم است
}));

// آیکن سوال با استایل جدید - هماهنگ با تم
const QuestionIcon = styled(Box)(({ theme }) => ({
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  // استفاده از رنگ primary با شفافیت کم برای پس‌زمینه آیکون
  backgroundColor: alpha(theme.palette.primary.main, 0.15),
  marginRight: theme.spacing(2), // در RTL به marginLeft تبدیل می‌شود؟ (بستگی به تنظیمات RTL دارد)
  transition: "all 0.3s ease",
  // استفاده از رنگ اصلی تم برای خود آیکون
  color: theme.palette.primary.main,
  "& svg": {
    fontSize: "20px",
  },
}));

// آرایه سوالات متداول (بدون تغییر)
const faqs = [
  {
    question: "پارس‌فلیکس چیست؟",
    answer:
      "پارس‌فلیکس یک سرویس استریم است که طیف گسترده‌ای از فیلم‌ها، سریال‌ها، مستندها و برنامه‌های تلویزیونی برنده جایزه را در هزاران دستگاه متصل به اینترنت ارائه می‌دهد. شما می‌توانید هر زمان که بخواهید، بدون محدودیت و بدون تبلیغات، به صورت نامحدود تماشا کنید - همه اینها تنها با یک اشتراک ماهانه. همیشه چیزهای جدیدی برای کشف وجود دارد و محتوای جدید هر هفته اضافه می‌شود!",
  },
  {
    question: "هزینه پارس‌فلیکس چقدر است؟",
    answer:
      "تماشای پارس‌فلیکس با طرح‌های مختلف، از 15 هزار تومان تا 45 هزار تومان در ماه متغیر است. بدون هزینه‌های اضافی یا قراردادها.",
  },
  {
    question: "کجا می‌توانم تماشا کنم؟",
    answer:
      "در هر جایی تماشا کنید، در هر زمانی. وارد حساب کاربری خود در وب‌سایت پارس‌فلیکس شوید تا بلافاصله از طریق رایانه شخصی یا از هر دستگاه متصل به اینترنت که برنامه پارس‌فلیکس را پشتیبانی می‌کند، مانند تلویزیون‌های هوشمند، تلفن‌های هوشمند، تبلت‌ها، پخش‌کننده‌های رسانه‌ای و کنسول‌های بازی تماشا کنید. همچنین می‌توانید برنامه‌های مورد علاقه خود را از طریق برنامه iOS، Android یا Windows 10 دانلود کنید. از قابلیت دانلود برای تماشا در حین سفر و بدون اتصال به اینترنت استفاده کنید. پارس‌فلیکس را همه جا با خود ببرید.",
  },
  {
    question: "چگونه می‌توانم اشتراکم را لغو کنم؟",
    answer:
      "پارس‌فلیکس انعطاف‌پذیر است. بدون قراردادهای آزاردهنده و بدون تعهد. به راحتی می‌توانید حساب کاربری خود را به صورت آنلاین با دو کلیک لغو کنید. هیچ هزینه لغوی وجود ندارد - حساب خود را هر زمان که بخواهید شروع یا متوقف کنید.",
  },
  {
    question: "چه چیزی می‌توانم در پارس‌فلیکس تماشا کنم؟",
    answer:
      "پارس‌فلیکس کتابخانه‌ای گسترده از فیلم‌های بلند، مستندها، سریال‌ها، آثار اصلی پارس‌فلیکس و موارد دیگر دارد. هر زمان که بخواهید، هر چقدر که بخواهید تماشا کنید.",
  },
  {
    question: "آیا پارس‌فلیکس برای کودکان مناسب است؟",
    answer:
      "تجربه پارس‌فلیکس برای کودکان شامل کنترل‌های والدین و یک پروفایل مخصوص کودکان است که به والدین اجازه می‌دهد محتوای مناسب سن کودکان را فیلتر کنند. پروفایل کودکان با PIN محافظت می‌شود تا کودکان نتوانند به پروفایل بزرگسالان دسترسی داشته باشند.",
  },
];

const FaqSection: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        // استفاده از رنگ پس‌زمینه پیش‌فرض تم یا گرادینت بر اساس آن
        background: `linear-gradient(to bottom, ${
          theme.palette.background.default
        } 0%, ${alpha(theme.palette.background.default, 0.85)} 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* المان‌های دکوراتیو - استفاده از رنگ‌های تم */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // مثال: استفاده از رنگ اولیه و ثانویه تم برای پترن زمینه
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
      <Box // دایره تزئینی بالا-راست
        sx={{
          position: "absolute",
          top: "10%",
          right: { xs: "-20%", md: "-10%" },
          width: { xs: "300px", md: "500px" },
          height: { xs: "300px", md: "500px" },
          // استفاده از رنگ primary تم با شفافیت
          background: `radial-gradient(circle, ${alpha(
            theme.palette.primary.main,
            0.08
          )} 0%, transparent 70%)`,
          borderRadius: "50%",
          zIndex: 0,
        }}
      />
      <Box // دایره تزئینی پایین-چپ
        sx={{
          position: "absolute",
          bottom: "5%",
          left: { xs: "-20%", md: "-10%" },
          width: { xs: "250px", md: "400px" },
          height: { xs: "250px", md: "400px" },
          // استفاده از رنگ secondary تم با شفافیت
          background: `radial-gradient(circle, ${alpha(
            theme.palette.secondary.main,
            0.05
          )} 0%, transparent 70%)`,
          borderRadius: "50%",
          zIndex: 0,
        }}
      />

      <Container maxWidth='lg' sx={{ position: "relative", zIndex: 1 }}>
        {/* عنوان بخش */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 8 }}>
          <CustomSectionTitle>
            <Typography
              variant={isMobile ? "h4" : "h3"}
              component='h2'
              sx={{
                fontWeight: 900,
                // استفاده از رنگ متن اصلی تم
                color: "text.primary",
                mb: 1.5,
                textAlign: "center",
                letterSpacing: "-0.5px",
              }}
            >
              سوالات متداول
            </Typography>
            <Typography
              variant='subtitle1'
              sx={{
                // استفاده از رنگ متن ثانویه تم
                color: "text.secondary",
                textAlign: "center",
                maxWidth: "600px",
                mx: "auto",
                fontSize: { xs: "0.95rem", md: "1.1rem" },
                lineHeight: 1.6,
              }}
            >
              پاسخ به سوالات رایج شما درباره سرویس پارس‌فلیکس
            </Typography>
          </CustomSectionTitle>
        </Box>

        {/* آکاردئون‌های سوالات متداول */}
        <Box sx={{ maxWidth: "900px", mx: "auto" }}>
          {faqs.map((faq, index) => (
            <StyledAccordion
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              disableGutters
              elevation={0} // چون از boxShadow خودمان استفاده می‌کنیم
            >
              <StyledAccordionSummary
                expandIcon={
                  expanded === `panel${index}` ? (
                    <RemoveIcon
                      sx={{
                        // آیکون منها: رنگ اصلی تم، پس‌زمینه بر اساس رنگ اصلی
                        color: theme.palette.primary.main,
                        fontSize: "1.6rem",
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        borderRadius: "50%",
                        padding: "4px",
                      }}
                    />
                  ) : (
                    <AddIcon
                      sx={{
                        // آیکون بعلاوه: رنگ متن اصلی (چون پس‌زمینه آکاردئون تیره است)، پس‌زمینه بر اساس رنگ اصلی
                        color: theme.palette.text.primary, // یا theme.palette.primary.contrastText اگر پس زمینه دایره‌ای رنگی است
                        fontSize: "1.6rem",
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        borderRadius: "50%",
                        padding: "4px",
                      }}
                    />
                  )
                }
                aria-controls={`panel${index}bh-content`}
                id={`panel${index}bh-header`}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <QuestionIcon>
                    <QuestionAnswerIcon />
                  </QuestionIcon>
                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 600,
                      // رنگ سوال: اگر باز است رنگ اصلی تم، وگرنه رنگ متن اصلی
                      color:
                        expanded === `panel${index}`
                          ? theme.palette.primary.main
                          : "text.primary",
                      fontSize: { xs: "1rem", md: "1.2rem" },
                      transition: "color 0.3s ease",
                    }}
                  >
                    {faq.question}
                  </Typography>
                </Box>
              </StyledAccordionSummary>
              <StyledAccordionDetails>
                <Typography
                  variant='body1'
                  sx={{
                    // رنگ پاسخ: رنگ متن ثانویه تم
                    color: "text.secondary",
                    lineHeight: 1.8,
                    fontSize: { xs: "0.95rem", md: "1rem" },
                    paddingLeft: { xs: 0, md: "58px" }, // این ممکن است نیاز به تنظیم برای RTL داشته باشد (paddingRight)
                  }}
                >
                  {faq.answer}
                </Typography>
              </StyledAccordionDetails>
            </StyledAccordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FaqSection;
