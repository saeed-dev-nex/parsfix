'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  ChangeEvent,
} from 'react';
import {
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
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Autocomplete,
  Chip,
  Checkbox,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  fetchSeriesById,
  updateSeries,
  clearSeriesError,
  clearSelectedSeries,
  selectSelectedSeriesDetail,
  selectSeriesIsProcessing,
  selectSeriesError,
  selectSeriesIsLoading,
  selectSeriesIsLoadingGenres,
  selectSeriesIsLoadingImageUpload,
  clearSeriesSuccessMessage,
  uploadSeriesPoster,
  uploadSeriesBackdrop,
  // fetchGenres, selectAllGenres, selectMovieIsLoadingGenres // برای ویرایش ژانر در آینده
} from '@/store/slices/seriesSlice';
import {
  SeriesStatus,
  Series,
  UpdateSeriesPayload,
  AuthError,
  Genre,
} from '@/types';
import {
  fetchGenres,
  selectAllGenres,
  selectMovieIsLoadingDetails,
} from '@/store/slices/movieSlice';
import { PhotoCamera } from '@mui/icons-material';

interface EditSeriesModalProps {
  open: boolean;
  seriesId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

// اینترفیس فرم ویرایش سریال (فیلدهای پایه)
interface SeriesEditFormData {
  title: string;
  originalTitle: string;
  tagline: string;
  description: string;
  firstAirDate: Date | null;
  lastAirDate: Date | null;
  numberOfSeasons: string;
  numberOfEpisodes: string;
  status: SeriesStatus | string;
  tmdbStatus: string;
  type: string;
  homepage: string;
  // ... سایر فیلدهای قابل ویرایش پایه
}

const initialFormData: SeriesEditFormData = {
  title: '',
  originalTitle: '',
  tagline: '',
  description: '',
  firstAirDate: null,
  lastAirDate: null,
  numberOfSeasons: '',
  numberOfEpisodes: '',
  status: SeriesStatus.PENDING,
  tmdbStatus: '',
  type: '',
  homepage: '',
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`series-tabpanel-${index}`}
      aria-labelledby={`series-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EditSeriesModal({
  open,
  seriesId,
  onClose,
  onSuccess,
}: EditSeriesModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const seriesDetails = useSelector(selectSelectedSeriesDetail);
  const error = useSelector(selectSeriesError);
  const allGenres = useSelector(selectAllGenres);
  const isProcessing = useSelector(selectSeriesIsProcessing);
  const isLoadingDetails = useSelector(selectSeriesIsLoading);
  const isLoadingGenres = useSelector(selectSeriesIsLoadingGenres);
  const isLoadingImageUpload = useSelector(selectSeriesIsLoadingImageUpload);
  const [formData, setFormData] = useState<SeriesEditFormData>(initialFormData);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);

  // --- State و Ref برای آپلود عکس ---
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [backdropPreview, setBackdropPreview] = useState<string | null>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const backdropInputRef = useRef<HTMLInputElement>(null);
  // ---------------------------------

  // واکشی جزئیات هنگام باز شدن
  useEffect(() => {
    if (open && seriesId) {
      dispatch(fetchSeriesById(seriesId));
      // dispatch(fetchGenres()); // واکشی ژانرها برای آینده
      if (!allGenres || allGenres.length === 0) {
        dispatch(fetchGenres());
      }
    }
    return () => {
      if (!open) {
        dispatch(clearSelectedSeries());
        dispatch(clearSeriesError());
      }
    };
  }, [open, seriesId, dispatch]);

  // پر کردن فرم
  useEffect(() => {
    if (seriesDetails && seriesDetails.id === seriesId) {
      const loadedGenreIds = seriesDetails.genres?.map((g) => g.id) || [];
      setFormData({
        title: seriesDetails.title || '',
        originalTitle: seriesDetails.originalTitle || '',
        tagline: seriesDetails.tagline || '',
        description: seriesDetails.description || '',
        firstAirDate: seriesDetails.firstAirDate
          ? new Date(seriesDetails.firstAirDate)
          : null,
        lastAirDate: seriesDetails.lastAirDate
          ? new Date(seriesDetails.lastAirDate)
          : null,
        numberOfSeasons: seriesDetails.numberOfSeasons?.toString() || '',
        numberOfEpisodes: seriesDetails.numberOfEpisodes?.toString() || '',
        status: seriesDetails.status || SeriesStatus.PENDING,
        tmdbStatus: seriesDetails.tmdbStatus || '',
        type: seriesDetails.type || '',
        homepage: seriesDetails.homepage || '',
        // ... مقداردهی سایر فیلدها ...
      });
      setSelectedGenreIds(loadedGenreIds);
      setPosterPreview(seriesDetails.posterPath || null);
      setBackdropPreview(seriesDetails.backdropPath || null);
    }
    return () => {
      if (posterPreview && posterPreview.startsWith('blob:'))
        URL.revokeObjectURL(posterPreview);
      if (backdropPreview && backdropPreview.startsWith('blob:'))
        URL.revokeObjectURL(backdropPreview);
    };
  }, [seriesDetails, seriesId]);

  // --- مدیریت آپلود عکس ---
  const handleImageChange = async (
    event: ChangeEvent<HTMLInputElement>,
    imageType: 'poster' | 'backdrop'
  ) => {
    const file = event.target.files?.[0];
    if (!file || !seriesId) return;
    // ... (ولیدیشن فایل) ...
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
    event.target.value = ''; // پاک کردن input

    // Dispatch آپلود
    dispatch(clearSeriesError());
    dispatch(clearSeriesSuccessMessage());
    const action =
      imageType === 'poster'
        ? uploadSeriesPoster({ seriesId, file })
        : uploadSeriesBackdrop({ seriesId, file });
    try {
      await dispatch(action).unwrap();
      // پیام موفقیت توسط useEffect بالا نمایش داده می‌شود
    } catch (err: any) {
      // خطا توسط useEffect بالا نمایش داده می‌شود
      // برگرداندن پیش‌نمایش به عکس قبلی
      if (imageType === 'poster')
        setPosterPreview(seriesDetails?.posterPath || null);
      else setBackdropPreview(seriesDetails?.backdropPath || null);
    }
  };
  const triggerFileInput = (type: 'poster' | 'backdrop') => {
    if (type === 'poster') posterInputRef.current?.click();
    else backdropInputRef.current?.click();
  };
  // ------------------------

  // Handlers
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name: fieldName, value } = e.target;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };
  const handleDateChange = (
    field: 'firstAirDate' | 'lastAirDate',
    newValue: Date | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: newValue }));
  };
  const handleSnackbarClose = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const handleSaveChanges = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!seriesId || !formData.title.trim()) return;
    dispatch(clearSeriesError());

    const updateData: UpdateSeriesPayload['updateData'] = {
      title: formData.title.trim(),
      originalTitle: formData.originalTitle.trim() || null,
      tagline: formData.tagline.trim() || null,
      description: formData.description.trim() || null,
      firstAirDate:
        formData.firstAirDate?.toISOString().substring(0, 10) || null,
      lastAirDate: formData.lastAirDate?.toISOString().substring(0, 10) || null,
      numberOfSeasons: formData.numberOfSeasons
        ? parseInt(formData.numberOfSeasons, 10) || null
        : null,
      numberOfEpisodes: formData.numberOfEpisodes
        ? parseInt(formData.numberOfEpisodes, 10) || null
        : null,
      status: formData.status as SeriesStatus,
      tmdbStatus: formData.tmdbStatus.trim() || null,
      type: formData.type.trim() || null,
      homepage: formData.homepage.trim() || null,
      genreIds: selectedGenreIds,
    };
    // حذف فیلدهای null/undefined/NaN
    Object.keys(updateData).forEach((key) => {
      /* ... */
    });

    try {
      const resultAction = await dispatch(
        updateSeries({ seriesId: seriesId!, updateData })
      ); // اطمینان از وجود seriesId
      if (updateSeries.fulfilled.match(resultAction)) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'خطا در آپدیت',
        severity: 'error',
      });
    }
  };
  // --- مدیریت تغییر انتخاب ژانرها ---
  const handleGenreChange = (
    event: React.SyntheticEvent,
    newValue: Genre[]
  ) => {
    setSelectedGenreIds(newValue.map((genre) => genre.id)); // ذخیره فقط ID ها
  };
  // -------------------------------
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='lg'
    >
      {' '}
      {/* ممکن است بزرگتر باشد */}
      <DialogTitle>ویرایش سریال: {seriesDetails?.title || ''}</DialogTitle>
      <DialogContent>
        {/* لودر یا خطا */}
        {isLoadingDetails && <CircularProgress />}
        {error && !isLoadingDetails && (
          <Alert
            severity='error'
            onClose={() => dispatch(clearSeriesError())}
          >
            {error.message}
          </Alert>
        )}

        {/* فرم */}
        {!isLoadingDetails && seriesDetails && (
          <form
            onSubmit={handleSaveChanges}
            id='edit-series-form'
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label='series edit tabs'
              >
                <Tab label='اطلاعات اصلی' />
                <Tab label='تاریخ‌ها و وضعیت' />
                <Tab label='توضیحات' />
                <Tab label='تصاویر' />
              </Tabs>
            </Box>

            <TabPanel
              value={tabValue}
              index={0}
            >
              <Grid
                container
                spacing={2}
              >
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label='عنوان سریال'
                    name='title'
                    value={formData.title}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={isProcessing}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label='عنوان اصلی'
                    name='originalTitle'
                    value={formData.originalTitle}
                    onChange={handleChange}
                    fullWidth
                    disabled={isProcessing}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label='شعار'
                    name='tagline'
                    value={formData.tagline}
                    onChange={handleChange}
                    fullWidth
                    disabled={isProcessing}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label='صفحه اصلی'
                    name='homepage'
                    value={formData.homepage}
                    onChange={handleChange}
                    fullWidth
                    disabled={isProcessing}
                  />
                </Grid>
                {/* --- انتخابگر ژانر --- */}
                <Grid size={{ xs: 12, md: 6 }}>
                  {/* در کنار فیلدهای دیگر */}
                  <Autocomplete
                    multiple
                    id='series-edit-genres-autocomplete'
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
                      <li
                        {...props}
                        key={option.id}
                      >
                        {' '}
                        {/* اضافه کردن key */}
                        <Checkbox checked={selected} /* ... */ /> {option.name}
                      </li>
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.name}
                          {...getTagProps({ index })}
                          key={option.id} /* ... sx ... */
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant='outlined'
                        label='ژانرها'
                        placeholder='انتخاب ژانر(ها)...'
                        InputLabelProps={{ sx: { color: 'grey.500' } }}
                        sx={
                          {
                            /* ... استایل ... */
                          }
                        }
                      />
                    )}
                    loading={isLoadingGenres}
                    loadingText='در حال بارگذاری ژانرها...'
                    disabled={isProcessing} // از isProcessing استفاده کنید
                    fullWidth
                  />
                </Grid>
                {/* ------------------- */}
              </Grid>
            </TabPanel>

            <TabPanel
              value={tabValue}
              index={1}
            >
              <Grid
                container
                spacing={2}
              >
                <Grid size={{ xs: 12, md: 6 }}>
                  <DatePicker
                    label='تاریخ شروع پخش'
                    value={formData.firstAirDate}
                    onChange={(d) => handleDateChange('firstAirDate', d)}
                    slotProps={{ textField: { fullWidth: true } }}
                    disabled={isProcessing}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DatePicker
                    label='تاریخ پایان پخش'
                    value={formData.lastAirDate}
                    onChange={(d) => handleDateChange('lastAirDate', d)}
                    slotProps={{ textField: { fullWidth: true } }}
                    disabled={isProcessing}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label='تعداد فصل'
                    name='numberOfSeasons'
                    type='number'
                    value={formData.numberOfSeasons}
                    onChange={handleChange}
                    fullWidth
                    disabled={isProcessing}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label='تعداد قسمت'
                    name='numberOfEpisodes'
                    type='number'
                    value={formData.numberOfEpisodes}
                    onChange={handleChange}
                    fullWidth
                    disabled={isProcessing}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl
                    fullWidth
                    disabled={isProcessing}
                  >
                    <InputLabel id='series-status-label'>وضعیت</InputLabel>
                    <Select
                      labelId='series-status-label'
                      name='status'
                      value={formData.status}
                      onChange={handleChange}
                      label='وضعیت'
                    >
                      {Object.values(SeriesStatus).map((s) => (
                        <MenuItem
                          key={s}
                          value={s}
                        >
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label='وضعیت TMDB'
                    name='tmdbStatus'
                    value={formData.tmdbStatus}
                    onChange={handleChange}
                    fullWidth
                    disabled={isProcessing}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel
              value={tabValue}
              index={2}
            >
              <Grid
                container
                spacing={2}
              >
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label='توضیحات'
                    name='description'
                    value={formData.description}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={6}
                    disabled={isProcessing}
                  />
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel
              value={tabValue}
              index={3}
            >
              {/* بخش آپلود عکس‌ها */}
              <Grid
                size={{ xs: 12 }}
                sx={{ mb: 2 }}
              >
                <Typography
                  variant='h6'
                  gutterBottom
                >
                  تصاویر سریال
                </Typography>
                <Grid
                  container
                  spacing={2}
                  alignItems='center'
                >
                  {/* آپلود پوستر */}
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                    sx={{ textAlign: 'center' }}
                  >
                    <Typography
                      variant='caption'
                      display='block'
                      gutterBottom
                    >
                      پوستر
                    </Typography>
                    <Box
                      sx={{
                        position: 'relative',
                        width: 120,
                        height: 180,
                        margin: 'auto',
                        border: '2px dashed grey',
                        /*...*/ cursor: 'pointer',
                      }}
                      onClick={() => triggerFileInput('poster')}
                    >
                      {isLoadingImageUpload ? (
                        <CircularProgress /*...*/ />
                      ) : posterPreview ? (
                        <img src={posterPreview} /*...*/ />
                      ) : (
                        <Box /* Placeholder */>
                          <PhotoCamera />
                        </Box>
                      )}
                    </Box>
                    <input
                      type='file'
                      hidden
                      ref={posterInputRef}
                      onChange={(e) => handleImageChange(e, 'poster')}
                      accept='image/*'
                      disabled={isLoadingImageUpload}
                    />
                  </Grid>
                  {/* آپلود بک‌دراپ */}
                  <Grid
                    size={{ xs: 12, sm: 6, md: 8, lg: 9 }}
                    sx={{
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '14px',
                    }}
                  >
                    <Typography
                      variant='caption'
                      display='block'
                      gutterBottom
                    >
                      بک‌دراپ
                    </Typography>
                    <Box
                      sx={{
                        position: 'relative',
                        width: '300px',
                        height: 180,
                        overflow: 'hidden',
                        border: '2px dashed grey',
                        /*...*/ cursor: 'pointer',
                      }}
                      onClick={() => triggerFileInput('backdrop')}
                    >
                      {isLoadingImageUpload ? (
                        <CircularProgress /*...*/ />
                      ) : backdropPreview ? (
                        <img
                          src={backdropPreview}
                          style={{ width: '100%', height: '180px' }}
                        />
                      ) : (
                        <Box /* Placeholder */>
                          <PhotoCamera />
                        </Box>
                      )}
                    </Box>
                    <input
                      type='file'
                      hidden
                      ref={backdropInputRef}
                      onChange={(e) => handleImageChange(e, 'backdrop')}
                      accept='image/*'
                      disabled={isLoadingImageUpload}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </TabPanel>
          </form>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={isProcessing}
        >
          انصراف
        </Button>
        <Button
          type='submit'
          form='edit-series-form'
          variant='contained'
          disabled={isProcessing || !seriesDetails}
        >
          {isProcessing ? <CircularProgress size={24} /> : 'ذخیره تغییرات'}
        </Button>
      </DialogActions>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant='filled'
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
