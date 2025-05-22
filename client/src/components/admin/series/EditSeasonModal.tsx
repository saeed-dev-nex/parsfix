'use client';

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
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
  Avatar,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import ImageIcon from '@mui/icons-material/Image';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  updateSeason,
  uploadSeasonPoster,
  clearSeasonError,
  clearSeasonSuccessMessage,
  selectSeasonIsLoadingUpdate,
  selectSeasonIsLoadingPosterUpload,
  selectSeasonError,
  selectSeasonSuccessMessage,
} from '@/store/slices/seasonSlice'; // <-- از seasonSlice
import { Season, UpdateSeasonData, AuthError } from '@/types';
import { clearSeriesSuccessMessage } from '@/store/slices/seriesSlice';
import { selectMovieIsLoadingDetails } from '@/store/slices/movieSlice';

interface EditSeasonModalProps {
  open: boolean;
  seasonData: Season | null; // داده‌های فصل فعلی
  onClose: () => void;
  onSuccess: () => void; // برای بستن مودال و نمایش پیام در والد
}

interface SeasonFormData {
  name: string;
  overview: string;
  airDate: Date | null;
}
const initialFormData: SeasonFormData = {
  name: '',
  overview: '',
  airDate: null,
};

export default function EditSeasonModal({
  open,
  seasonData,
  onClose,
  onSuccess,
}: EditSeasonModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isLoadingUpdate = useSelector(selectSeasonIsLoadingUpdate);
  const isLoadingPosterUpload = useSelector(selectSeasonIsLoadingPosterUpload);
  const error = useSelector(selectSeasonError);
  const successMessage = useSelector(selectSeasonSuccessMessage);
  const isLoadingDetails = useSelector(selectMovieIsLoadingDetails);
  const [formData, setFormData] = useState<SeasonFormData>(initialFormData);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const [isDirty, setIsDirty] = useState(false); // برای فعال کردن دکمه ذخیره
  console.log('season data is ----->',  seasonData);

  // پر کردن فرم و ریست dirty flag هنگام باز شدن یا تغییر seasonData
  useEffect(() => {
    if (open && seasonData) {
      setFormData({
        name: seasonData.name || '',
        overview: seasonData.overview || '',
        airDate: seasonData.airDate ? new Date(seasonData.airDate) : null,
      });
      setPosterPreview(seasonData.posterPath || null);
      setIsDirty(false); // در ابتدا فرم تغییر نکرده
    }
    // پاک کردن خطا/پیام هنگام بسته شدن
    return () => {
      if (!open) {
        dispatch(clearSeasonError());
        dispatch(clearSeasonSuccessMessage());
        if (posterPreview && posterPreview.startsWith('blob:'))
          URL.revokeObjectURL(posterPreview);
      }
    };
  }, [open, seasonData, dispatch]);

  // نمایش Snackbar
  useEffect(() => {
    // ... (منطق نمایش Snackbar مشابه مودال‌های دیگر) ...
  }, [error, successMessage, dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setIsDirty(true);
  };
  const handleDateChange = (newValue: Date | null) => {
    setFormData((prev) => ({ ...prev, airDate: newValue }));
    setIsDirty(true);
  };
  const triggerPosterInput = () => posterInputRef.current?.click();

  const handlePosterChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !seasonData?.id) return;
    // ... (ولیدیشن فایل) ...
    const objectUrl = URL.createObjectURL(file);
    if (posterPreview && posterPreview.startsWith('blob:'))
      URL.revokeObjectURL(posterPreview);
    setPosterPreview(objectUrl);
    if (posterInputRef.current) posterInputRef.current.value = '';

    // Dispatch آپلود پوستر فصل
    dispatch(clearSeasonError());
    dispatch(clearSeasonSuccessMessage());
    try {
      await dispatch(
        uploadSeasonPoster({ seasonId: seasonData.id, file })
      ).unwrap();
      // پیام موفقیت از useEffect بالا می آید
    } catch (err) {
      setPosterPreview(seasonData.posterPath || null); // برگرداندن پیش‌نمایش
      // پیام خطا از useEffect بالا می آید
    }
  };

  // ذخیره تغییرات اطلاعات پایه فصل
  const handleSaveChanges = async () => {
    if (!seasonData?.id || !isDirty) return;
    dispatch(clearSeasonError());
    dispatch(clearSeriesSuccessMessage());

    const updateData: UpdateSeasonData = {
      name: formData.name.trim() || null,
      overview: formData.overview.trim() || null,
      airDate: formData.airDate?.toISOString().substring(0, 10) || null,
    };
    // حذف فیلدهای null اگر سرور نپذیرد
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof UpdateSeasonData] === null)
        delete updateData[key as keyof UpdateSeasonData];
    });

    try {
      await dispatch(
        updateSeason({ seasonId: seasonData.id, updateData })
      ).unwrap();
      onSuccess(); // بستن مودال و نمایش پیام در والد
      // onClose(); // نیاز نیست چون onSuccess مودال را می‌بندد
    } catch (err) {
      // خطا در Snackbar نمایش داده می‌شود
    }
  };

  const currentLoading =
    isLoadingDetails || isLoadingUpdate || isLoadingPosterUpload;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='sm'
    >
      <DialogTitle>ویرایش فصل {seasonData?.seasonNumber}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert
            severity='error'
            sx={{ mb: 2 }}
          >
            {error.message}
          </Alert>
        )}
        <Grid
          container
          spacing={2}
          sx={{ mt: 1 }}
        >
          {/* آپلود پوستر */}
          <Grid
            size={{ xs: 12, sm: 8 }}
            sx={{ textAlign: 'center' }}
          >
            <Typography
              variant='caption'
              display='block'
              gutterBottom
            >
              پوستر فصل
            </Typography>
            <Box
              sx={{
                position: 'relative',
                width: 100,
                height: 150,
                margin: 'auto',
                border: '2px dashed grey',
                cursor: 'pointer',
              }}
              onClick={triggerPosterInput}
            >
              {isLoadingPosterUpload ? (
                <CircularProgress />
              ) : posterPreview ? (
                <img
                  src={posterPreview}
                  alt='پوستر'
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Box
                  sx={
                    {
                      /* Placeholder */
                    }
                  }
                >
                  <ImageIcon />
                </Box>
              )}
            </Box>
            <input
              type='file'
              hidden
              ref={posterInputRef}
              onChange={handlePosterChange}
              accept='image/*'
              disabled={currentLoading}
            />
          </Grid>
          {/* فیلدهای اطلاعات */}
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              label='نام فصل'
              name='name'
              value={formData.name}
              onChange={handleChange}
              fullWidth
              margin='dense'
              disabled={currentLoading}
            />
            <DatePicker
              label='تاریخ پخش'
              value={formData.airDate}
              onChange={handleDateChange}
              slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
              disabled={currentLoading}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label='توضیحات فصل'
              name='overview'
              value={formData.overview}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              margin='dense'
              disabled={currentLoading}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={currentLoading}
        >
          انصراف
        </Button>
        <Button
          onClick={handleSaveChanges}
          variant='contained'
          disabled={currentLoading || !isDirty}
        >
          {isLoadingUpdate ? <CircularProgress size={24} /> : 'ذخیره فصل'}
        </Button>
      </DialogActions>
      {/* Snackbar در والد نمایش داده می‌شود */}
    </Dialog>
  );
}
