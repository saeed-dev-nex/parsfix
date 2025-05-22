// client/src/components/admin/EditMovieModal.tsx
'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ChangeEvent,
} from 'react';
import {
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Box,
  Grid,
  FormControl,
  InputAdornment,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  Snackbar,
  Autocomplete,
  Checkbox,
  Chip,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import TitleIcon from '@mui/icons-material/Title';
import SaveIcon from '@mui/icons-material/Save';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  fetchMovieById,
  updateMovie,
  clearMovieError,
  clearSelectedMovie,
  clearMovieSuccessMessage,
  fetchGenres, // واکشی ژانرها
  selectSelectedMovieDetail,
  selectMovieIsLoadingDetails,
  selectMovieIsLoadingCreateUpdate,
  selectMovieError,
  selectMovieSuccessMessage,
  selectAllGenres, // سلکتور ژانرها
  selectMovieIsLoadingGenres,
  uploadMoviePoster,
  uploadMovieBackdrop,
  selectMovieIsLoadingImageUpload, // لودینگ ژانرها
} from '@/store/slices/movieSlice';
import {
  MovieStatus,
  Gender,
  Movie,
  Genre,
  UpdateMoviePayload,
  AuthError,
} from '@/types'; // انواع لازم
import { PhotoCamera } from '@mui/icons-material';

// پراپ‌های ورودی مودال
interface EditMovieModalProps {
  open: boolean;
  movieId: string | null; // ID فیلم برای ویرایش
  onClose: () => void;
  onSuccess: () => void; // برای رفرش لیست پس از آپدیت موفق
}

// اینترفیس برای state فرم محلی
interface MovieEditFormData {
  title: string;
  originalTitle: string;
  tagline: string;
  description: string;
  releaseDate: Date | null;
  runtime: string;
  status: MovieStatus | string;
  originalLanguage: string;
  imdbId: string;
  adult: boolean;
  trailerUrl: string;
  imdbRating: string;
  rottenTomatoesScore: string;
  // posterPath, backdropPath نیاز به منطق آپلود جدا دارند، فعلا ویرایش نمی‌شوند
}

// مقادیر اولیه خالی برای فرم
const initialFormData: MovieEditFormData = {
  title: '',
  originalTitle: '',
  tagline: '',
  description: '',
  releaseDate: null,
  runtime: '',
  status: MovieStatus.PENDING,
  originalLanguage: '',
  imdbId: '',
  adult: false,
  trailerUrl: '',
  imdbRating: '',
  rottenTomatoesScore: '',
};

export default function EditMovieModal({
  open,
  movieId,
  onClose,
  onSuccess,
}: EditMovieModalProps) {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  const dispatch = useDispatch<AppDispatch>();

  // خواندن state های لازم از Redux
  const movieDetails = useSelector(selectSelectedMovieDetail);
  const isLoadingDetails = useSelector(selectMovieIsLoadingDetails);
  const isLoadingUpdate = useSelector(selectMovieIsLoadingCreateUpdate);
  const serverError = useSelector(selectMovieError); // تغییر نام برای عدم تداخل
  const allGenres = useSelector(selectAllGenres);
  const isLoadingGenres = useSelector(selectMovieIsLoadingGenres);
  const isLoadingImageUpload = useSelector(selectMovieIsLoadingImageUpload);
  const successMessage = useSelector(selectMovieSuccessMessage); // برای Snackbar
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [backdropPreview, setBackdropPreview] = useState<string | null>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const backdropInputRef = useRef<HTMLInputElement>(null);
  // State محلی فرم
  const [formData, setFormData] = useState<MovieEditFormData>(initialFormData);
  // State برای ID ژانرهای انتخاب شده
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  // State برای پیام Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  // --- Refs برای نگهداری مقادیر اولیه (جهت مقایسه تغییرات) ---
  const initialFormStateRef = useRef<MovieEditFormData>(initialFormData);
  const initialGenreIdsRef = useRef<string[]>([]);
  // ----------------------------------------------------------

  // واکشی جزئیات فیلم و لیست کل ژانرها
  useEffect(() => {
    if (open && movieId) {
      console.log(`EditModal: Fetching details for movie ID: ${movieId}`);
      dispatch(fetchMovieById(movieId));
      // فقط یک بار ژانرها را واکشی کن یا اگر خالی هستند
      if (!allGenres || allGenres.length === 0) {
        dispatch(fetchGenres());
      }
    }
    // پاک کردن جزئیات و خطا هنگام بسته شدن
    return () => {
      if (!open) {
        dispatch(clearSelectedMovie());
        dispatch(clearMovieError());
        dispatch(clearMovieSuccessMessage());
        // ریست کردن state های محلی
        setFormData(initialFormData);
        setSelectedGenreIds([]);
      }
    };
  }, [open, movieId, dispatch, allGenres]); // allGenres اضافه شد

  // پر کردن فرم و لیست ژانرها پس از واکشی موفق
  useEffect(() => {
    if (movieDetails && movieDetails.id === movieId) {
      console.log('EditModal: Populating form with details', movieDetails);
      const loadedData: MovieEditFormData = {
        title: movieDetails.title || '',
        originalTitle: movieDetails.originalTitle || '',
        tagline: movieDetails.tagline || '',
        description: movieDetails.description || '',
        releaseDate: movieDetails.releaseDate
          ? new Date(movieDetails.releaseDate)
          : null,
        runtime: movieDetails.runtime?.toString() || '',
        status: movieDetails.status || MovieStatus.PENDING,
        originalLanguage: movieDetails.originalLanguage || '',
        imdbId: movieDetails.imdbId || '',
        adult: movieDetails.adult || false,
        trailerUrl: movieDetails.trailerUrl || '',
        imdbRating: movieDetails.imdbRating?.toString() || '',
        rottenTomatoesScore: movieDetails.rottenTomatoesScore?.toString() || '',
      };
      const loadedGenreIds = movieDetails.genres?.map((g) => g.id) || [];
      setSelectedGenreIds(movieDetails.genres?.map((g) => g.id) || []);
      setFormData(loadedData);
      setSelectedGenreIds(loadedGenreIds);
      setPosterPreview(movieDetails.posterPath || null);
      setBackdropPreview(movieDetails.backdropPath || null);
      // ذخیره مقادیر اولیه برای مقایسه
      initialFormStateRef.current = loadedData;
      initialGenreIdsRef.current = loadedGenreIds;
    }
    return () => {
      if (posterPreview && posterPreview.startsWith('blob:'))
        URL.revokeObjectURL(posterPreview);
      if (backdropPreview && backdropPreview.startsWith('blob:'))
        URL.revokeObjectURL(backdropPreview);
    };
  }, [movieDetails, movieId]);

  // بررسی اینکه آیا تغییری در فرم رخ داده است
  const isFormDirty = useMemo(() => {
    const initialForm = initialFormStateRef.current;
    const initialGenres = initialGenreIdsRef.current;

    // مقایسه فیلدهای مستقیم
    let fieldsChanged = false;
    for (const key in initialForm) {
      if (key === 'releaseDate') {
        if (
          (formData.releaseDate?.toISOString() ?? null) !==
          (initialForm.releaseDate?.toISOString() ?? null)
        ) {
          fieldsChanged = true;
          break;
        }
      } else if (
        String(formData[key as keyof MovieEditFormData]).trim() !==
        String(initialForm[key as keyof MovieEditFormData]).trim()
      ) {
        fieldsChanged = true;
        break;
      }
    }

    // مقایسه ژانرها (بررسی طول آرایه و وجود همه اعضا)
    const genresChanged =
      selectedGenreIds.length !== initialGenres.length ||
      !selectedGenreIds.every((id) => initialGenres.includes(id)) ||
      !initialGenres.every((id) => selectedGenreIds.includes(id));

    return fieldsChanged || genresChanged;
  }, [formData, selectedGenreIds]);

  // مدیریت عمومی تغییر ورودی‌های TextField و Select
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name: fieldName, value } = e.target;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  // مدیریت تغییر تاریخ
  const handleDateChange = (newValue: Date | null) => {
    setFormData((prev) => ({ ...prev, releaseDate: newValue }));
  };

  // مدیریت تغییر انتخاب ژانرها
  const handleGenreChange = (
    event: React.SyntheticEvent,
    newValue: Genre[]
  ) => {
    setSelectedGenreIds(newValue.map((genre) => genre.id));
  };
  // --- مدیریت آپلود عکس ---
  const handleImageChange = async (
    event: ChangeEvent<HTMLInputElement>,
    imageType: 'poster' | 'backdrop'
  ) => {
    const file = event.target.files?.[0];
    if (!file || !movieId) return;

    // ولیدیشن کلاینت
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!allowedTypes.includes(file.type)) {
      /* ... Snackbar خطا ... */ return;
    }
    if (file.size > maxSize) {
      /* ... Snackbar خطا ... */ return;
    }

    // ایجاد پیش‌نمایش
    const objectUrl = URL.createObjectURL(file);
    if (imageType === 'poster') {
      if (posterPreview && posterPreview.startsWith('blob:'))
        URL.revokeObjectURL(posterPreview);
      setPosterPreview(objectUrl);
    } else {
      if (backdropPreview && backdropPreview.startsWith('blob:'))
        URL.revokeObjectURL(backdropPreview);
      setBackdropPreview(objectUrl);
    }

    // پاک کردن value اینپوت
    event.target.value = '';

    // Dispatch کردن Thunk آپلود مربوطه
    let action;
    if (imageType === 'poster') {
      action = uploadMoviePoster({ movieId, file });
    } else {
      action = uploadMovieBackdrop({ movieId, file });
    }

    try {
      await dispatch(action).unwrap(); // برای گرفتن خطا در صورت reject
      setSnackbar({
        open: true,
        message: `عکس ${
          imageType === 'poster' ? 'پوستر' : 'بک‌دراپ'
        } با موفقیت آپلود شد.`,
        severity: 'success',
      });
      // URL در Redux state آپدیت می‌شود و Avatar/img به‌روز خواهد شد
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || `خطا در آپلود عکس ${imageType}.`,
        severity: 'error',
      });
      // برگرداندن پیش‌نمایش به عکس قبلی از Redux state
      if (imageType === 'poster')
        setPosterPreview(movieDetails?.posterPath || null);
      else setBackdropPreview(movieDetails?.backdropPath || null);
    }
  };

  const triggerFileInput = (type: 'poster' | 'backdrop') => {
    if (type === 'poster') posterInputRef.current?.click();
    else backdropInputRef.current?.click();
  };
  // ------------------------

  // ذخیره تغییرات
  const handleSaveChanges = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!movieId || !formData.title.trim()) {
      setSnackbar({
        open: true,
        message: 'عنوان فیلم الزامی است.',
        severity: 'warning',
      });
      return;
    }
    dispatch(clearMovieError());

    // آماده‌سازی داده‌ها فقط شامل موارد تغییر یافته یا لازم
    const updateData: UpdateMoviePayload['updateData'] = {
      // فیلدهای مستقیم
      title: formData.title.trim(),
      originalTitle: formData.originalTitle.trim() || null,
      tagline: formData.tagline.trim() || null,
      description: formData.description.trim() || null,
      releaseDate: formData.releaseDate
        ? formData.releaseDate.toISOString().substring(0, 10)
        : null, // ارسال YYYY-MM-DD
      runtime: formData.runtime ? parseInt(formData.runtime, 10) || null : null,
      status: formData.status as MovieStatus,
      originalLanguage: formData.originalLanguage.trim() || null,
      imdbId: formData.imdbId.trim() || null,
      adult: formData.adult,
      trailerUrl: formData.trailerUrl.trim() || null,
      imdbRating: formData.imdbRating ? parseFloat(formData.imdbRating) : null,
      rottenTomatoesScore: formData.rottenTomatoesScore
        ? parseInt(formData.rottenTomatoesScore, 10)
        : null,
      // ارسال آرایه ID های ژانر
      genreIds: selectedGenreIds,
    };

    // حذف مقادیر null/undefined/NaN که نباید ارسال شوند (اختیاری، سرور هم می‌تواند هندل کند)
    Object.keys(updateData).forEach((key) => {
      const value = updateData[key as keyof typeof updateData];
      if (
        value === null ||
        value === undefined ||
        (typeof value === 'number' && isNaN(value))
      ) {
        if (key !== 'genreIds')
          delete updateData[key as keyof typeof updateData];
      }
    });

    console.log('Submitting update for movie:', movieId, updateData);
    const resultAction = await dispatch(updateMovie({ movieId, updateData }));

    if (updateMovie.fulfilled.match(resultAction)) {
      console.log('Update successful');
      onSuccess(); // رفرش لیست در والد
      onClose(); // بستن مودال
      // پیام موفقیت در اسنک بار والد نمایش داده می‌شود (از طریق Redux state)
    } else {
      // خطا توسط Redux مدیریت و در Alert نمایش داده می‌شود
      console.error('Update failed:', resultAction.payload);
      setSnackbar({
        open: true,
        message:
          (resultAction.payload as AuthError)?.message || 'خطا در به‌روزرسانی',
        severity: 'error',
      });
    }
  };

  const handleSnackbarClose = (/* ... */) => {
    /* ... */ setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='md'
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '16px',
          boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.1)',
          background:
            'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(20,20,20,0.98) 100%)',
          backdropFilter: 'blur(12px)',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 'bold',
          borderBottom: '1px solid divider',
          bgcolor: 'primary.main',
          color: 'common.white',
          py: 2,
          px: 3,
          borderRadius: '12px 12px 0 0',
        }}
      >
        ویرایش فیلم: {movieDetails?.title || ''}
      </DialogTitle>
      <DialogContent sx={{ pt: '20px !important', px: 0 }}>
        {isLoadingDetails && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 300,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {serverError &&
          !isLoadingDetails && ( // نمایش خطای fetch یا update
            <Alert
              severity='error'
              sx={{ mb: 2 }}
              onClose={() => dispatch(clearMovieError())}
            >
              {serverError.message}
            </Alert>
          )}
        {/* نمایش پیام موفقیت از Redux */}
        {/* {successMessage && ( <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert> )} */}

        {!isLoadingDetails && movieDetails && (
          <form
            onSubmit={handleSaveChanges}
            id='edit-movie-form'
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{ px: 3, mb: 2 }}
            >
              <Tab label='اطلاعات اصلی' />
              <Tab label='جزئیات فنی' />
              <Tab label='امتیازات' />
              <Tab label='تصاویر' />
            </Tabs>

            {/* تب ۱: اطلاعات اصلی */}
            {activeTab === 0 && (
              <Grid
                container
                spacing={3}
                sx={{ mt: 1, px: 3 }}
              >
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <CardContent sx={{ p: '8px !important' }}>
                      <TextField
                        label='عنوان فیلم'
                        name='title'
                        value={formData.title}
                        onChange={handleChange}
                        fullWidth
                        variant='outlined'
                        required
                        disabled={isLoadingUpdate}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <TitleIcon color='primary' />
                            </InputAdornment>
                          ),
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: 'rgba(255,255,255,0.1)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255,255,255,0.2)',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          },
                        }}
                        sx={{
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255,255,255,0.7)',
                            '&.Mui-focused': { color: 'primary.main' },
                          },
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label='عنوان اصلی'
                    name='originalTitle'
                    value={formData.originalTitle}
                    onChange={handleChange}
                    fullWidth
                    variant='outlined'
                    disabled={isLoadingUpdate}
                  />
                </Grid>
                <Grid
                  size={{xs:12}}
                >
                  <TextField
                    label='شعار فیلم (Tagline)'
                    name='tagline'
                    value={formData.tagline}
                    onChange={handleChange}
                    fullWidth
                    variant='outlined'
                    disabled={isLoadingUpdate}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label='توضیحات'
                    name='description'
                    value={formData.description}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={4}
                    variant='outlined'
                    disabled={isLoadingUpdate}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DatePicker
                    label='تاریخ انتشار (شمسی)'
                    value={formData.releaseDate}
                    onChange={handleDateChange}
                    disabled={isLoadingUpdate}
                    slotProps={{
                      textField: { fullWidth: true, variant: 'outlined' },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Autocomplete
                    multiple
                    id='movie-genres-edit-autocomplete'
                    options={allGenres || []}
                    value={
                      allGenres?.filter((genre) =>
                        selectedGenreIds.includes(genre.id)
                      ) || []
                    }
                    onChange={handleGenreChange}
                    getOptionLabel={(option) => option.name || ''}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox checked={selected} /> {option.name}
                      </li>
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.name}
                          {...getTagProps({ index })}
                          key={option.id}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant='outlined'
                        label='ژانرها'
                        placeholder='انتخاب ژانر(ها)...'
                      />
                    )}
                    loading={isLoadingGenres}
                    loadingText='در حال بارگذاری ژانرها...'
                    disabled={isLoadingUpdate}
                    fullWidth
                  />
                </Grid>
              </Grid>
            )}

            {/* تب ۲: جزئیات فنی */}
            {activeTab === 1 && (
              <Grid
                container
                spacing={3}
                sx={{ mt: 1, px: 3 }}
              >
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    label='مدت زمان (دقیقه)'
                    name='runtime'
                    type='number'
                    value={formData.runtime}
                    onChange={handleChange}
                    fullWidth
                    variant='outlined'
                    disabled={isLoadingUpdate}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl
                    fullWidth
                    variant='outlined'
                    disabled={isLoadingUpdate}
                  >
                    <InputLabel id='status-edit-label'>وضعیت انتشار</InputLabel>
                    <Select
                      labelId='status-edit-label'
                      name='status'
                      value={formData.status}
                      onChange={handleChange}
                      label='وضعیت انتشار'
                    >
                      <MenuItem value={MovieStatus.PENDING}>در انتظار</MenuItem>
                      <MenuItem value={MovieStatus.PUBLISHED}>
                        منتشر شده
                      </MenuItem>
                      <MenuItem value={MovieStatus.ARCHIVED}>بایگانی</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    label='زبان اصلی'
                    name='originalLanguage'
                    value={formData.originalLanguage}
                    onChange={handleChange}
                    fullWidth
                    variant='outlined'
                    disabled={isLoadingUpdate}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    label='شناسه IMDb'
                    name='imdbId'
                    value={formData.imdbId}
                    onChange={handleChange}
                    fullWidth
                    variant='outlined'
                    disabled={isLoadingUpdate}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl
                    fullWidth
                    variant='outlined'
                    disabled={isLoadingUpdate}
                  >
                    <InputLabel id='adult-label'>محتوای بزرگسال</InputLabel>
                    <Select
                      labelId='adult-label'
                      name='adult'
                      value={formData.adult ? 'true' : 'false'}
                      onChange={handleChange}
                      label='محتوای بزرگسال'
                    >
                      <MenuItem value={'false'}>خیر</MenuItem>
                      <MenuItem value={'true'}>بله</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    label='لینک تریلر (یوتیوب)'
                    name='trailerUrl'
                    type='url'
                    value={formData.trailerUrl}
                    onChange={handleChange}
                    fullWidth
                    variant='outlined'
                    disabled={isLoadingUpdate}
                  />
                </Grid>
              </Grid>
            )}

            {/* تب ۳: امتیازات */}
            {activeTab === 2 && (
              <Grid
                container
                spacing={3}
                sx={{ mt: 1, px: 3 }}
              >
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label='امتیاز IMDb'
                    name='imdbRating'
                    type='number'
                    inputProps={{ step: '0.1' }}
                    value={formData.imdbRating}
                    onChange={handleChange}
                    fullWidth
                    variant='outlined'
                    disabled={isLoadingUpdate}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label='امتیاز Rotten Tomatoes (%)'
                    name='rottenTomatoesScore'
                    type='number'
                    inputProps={{ step: '1' }}
                    value={formData.rottenTomatoesScore}
                    onChange={handleChange}
                    fullWidth
                    variant='outlined'
                    disabled={isLoadingUpdate}
                  />
                </Grid>
              </Grid>
            )}
          </form>
        )}
        {/* تب ۴: تصاویر */}
        {activeTab === 3 && (
          <Grid
            container
            spacing={3}
            sx={{ mt: 1, px: 3 }}
            alignItems='center'
          >
            <Grid size={{ xs: 12, sm: 6, md: 9 }}>
              <Typography
                variant='h6'
                gutterBottom
                sx={{ fontWeight: 'bold', color: 'white', mb: 2 }}
              >
                پوستر فیلم
              </Typography>
              <Box
                sx={{
                  position: 'relative',
                  width: 150,
                  height: 220,
                  margin: 'auto',
                  border: '2px dashed rgba(255, 255, 255, 0.3)',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  },
                }}
                onClick={() => triggerFileInput('poster')}
              >
                {isLoadingImageUpload ? (
                  <CircularProgress
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ) : posterPreview ? (
                  <img
                    src={posterPreview}
                    alt='پیش‌نمایش پوستر'
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: 'grey.500',
                    }}
                  >
                    <PhotoCamera sx={{ fontSize: 40 }} />
                    <Typography variant='caption'>آپلود پوستر</Typography>
                  </Box>
                )}
              </Box>
              <input
                type='file'
                hidden
                ref={posterInputRef}
                onChange={(e) => handleImageChange(e, 'poster')}
                accept='image/*'
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 9 }}>
              <Typography
                variant='h6'
                gutterBottom
                sx={{ fontWeight: 'bold', color: 'white', mb: 2 }}
              >
                تصویر پس زمینه فیلم
              </Typography>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 220,
                  border: '2px dashed rgba(255, 255, 255, 0.3)',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  },
                }}
                onClick={() => triggerFileInput('backdrop')}
              >
                {isLoadingImageUpload ? (
                  <CircularProgress
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ) : backdropPreview ? (
                  <img
                    src={backdropPreview}
                    alt='پیش‌نمایش بک‌دراپ'
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: 'grey.500',
                    }}
                  >
                    <PhotoCamera sx={{ fontSize: 40 }} />
                    <Typography variant='caption'>آپلود بک‌دراپ</Typography>
                  </Box>
                )}
              </Box>
              <input
                type='file'
                hidden
                ref={backdropInputRef}
                onChange={(e) => handleImageChange(e, 'backdrop')}
                accept='image/*'
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid divider', p: '16px 24px' }}>
        <Button
          onClick={onClose}
          color='inherit'
          disabled={isLoadingDetails || isLoadingUpdate}
        >
          انصراف
        </Button>
        <Button
          type='submit'
          form='edit-movie-form'
          variant='contained'
          color='primary'
          // دکمه ذخیره فقط وقتی فعال است که لودینگ نباشد، جزئیات آمده باشد و تغییری رخ داده باشد
          disabled={
            isLoadingDetails || isLoadingUpdate || !movieDetails || !isFormDirty
          }
          startIcon={<SaveIcon />}
        >
          {isLoadingUpdate ? <CircularProgress size={24} /> : 'ذخیره تغییرات'}
        </Button>
      </DialogActions>
      {/* Snackbar برای پیام‌های موفقیت/خطا از والد می آید */}
      {/* <Snackbar open={snackbar.open} ... /> */}
    </Dialog>
  );
}
