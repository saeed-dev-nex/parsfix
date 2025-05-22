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
import MovieFilterIcon from '@mui/icons-material/MovieFilter'; // آیکن برای still
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  updateEpisode,
  uploadEpisodeStill,
  clearEpisodeError,
  clearEpisodeSuccessMessage,
  selectEpisodeIsLoadingUpdate,
  selectEpisodeIsLoadingStillUpload,
  selectEpisodeError,
  selectEpisodeSuccessMessage,
} from '@/store/slices/episodeSlice'; // <-- از episodeSlice
import { Episode, UpdateEpisodeData, AuthError } from '@/types';

interface EditEpisodeModalProps {
  open: boolean;
  episodeData: Episode | null; // داده‌های قسمت فعلی
  onClose: () => void;
  onSuccess: () => void;
}

interface EpisodeFormData {
  title: string;
  overview: string;
  airDate: Date | null;
  runtime: string;
}
const initialFormData: EpisodeFormData = {
  title: '',
  overview: '',
  airDate: null,
  runtime: '',
};

export default function EditEpisodeModal({
  open,
  episodeData,
  onClose,
  onSuccess,
}: EditEpisodeModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isLoadingUpdate = useSelector(selectEpisodeIsLoadingUpdate);
  const isLoadingStillUpload = useSelector(selectEpisodeIsLoadingStillUpload);
  const error = useSelector(selectEpisodeError);
  // successMessage از والد (صفحه ویرایش سریال) مدیریت می‌شود چون آپدیت قسمت در آنجا مشاهده می‌شود

  const [formData, setFormData] = useState<EpisodeFormData>(initialFormData);
  const [stillPreview, setStillPreview] = useState<string | null>(null);
  const stillInputRef = useRef<HTMLInputElement>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (open && episodeData) {
      setFormData({
        title: episodeData.title || '',
        overview: episodeData.overview || '',
        airDate: episodeData.airDate ? new Date(episodeData.airDate) : null,
        runtime: episodeData.runtime?.toString() || '',
      });
      setStillPreview(episodeData.stillPath || null);
      setIsDirty(false);
    }
    return () => {
      if (!open) {
        dispatch(
          clearEpisodeError()
        ); /* dispatch(clearEpisodeSuccessMessage()); */
      }
    };
  }, [open, episodeData, dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    /* ... */ setIsDirty(true);
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleDateChange = (newValue: Date | null) => {
    /* ... */ setIsDirty(true);
    setFormData((prev) => ({ ...prev, airDate: newValue }));
  };
  const triggerStillInput = () => stillInputRef.current?.click();

  const handleStillChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !episodeData?.id) return;
    // ... (ولیدیشن فایل) ...
    const objectUrl = URL.createObjectURL(file);
    if (stillPreview && stillPreview.startsWith('blob:'))
      URL.revokeObjectURL(stillPreview);
    setStillPreview(objectUrl);
    if (stillInputRef.current) stillInputRef.current.value = '';

    dispatch(clearEpisodeError()); /* dispatch(clearEpisodeSuccessMessage()); */
    try {
      await dispatch(
        uploadEpisodeStill({ episodeId: episodeData.id, file })
      ).unwrap();
      // پیام موفقیت در والد از طریق رفرش seriesDetails نشان داده می‌شود
    } catch (err) {
      setStillPreview(episodeData.stillPath || null);
      // پیام خطا در والد
    }
  };

  const handleSaveChanges = async () => {
    if (!episodeData?.id || !formData.title.trim()) return;
    dispatch(clearEpisodeError()); /* dispatch(clearEpisodeSuccessMessage()); */
    const updateData: UpdateEpisodeData = {
      title: formData.title.trim() || null,
      overview: formData.overview.trim() || null,
      airDate: formData.airDate?.toISOString().substring(0, 10) || null,
      runtime: formData.runtime ? parseInt(formData.runtime, 10) || null : null,
    };
    // ... (حذف فیلدهای null) ...
    try {
      await dispatch(
        updateEpisode({ episodeId: episodeData.id, updateData })
      ).unwrap();
      onSuccess();
      onClose();
    } catch (err) {
      /* خطا در والد نمایش داده می‌شود */
    }
  };

  const currentLoading = isLoadingUpdate || isLoadingStillUpload;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='sm'
    >
      <DialogTitle>
        ویرایش قسمت {episodeData?.episodeNumber} (فصل{' '}
        {episodeData?.seasonNumber})
      </DialogTitle>
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
          {/* آپلود عکس صحنه */}
          <Grid
            size={{ xs: 12 }}
            sx={{ textAlign: 'center' }}
          >
            <Typography
              variant='caption'
              display='block'
              gutterBottom
            >
              عکس صحنه (Still)
            </Typography>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: 120,
                border: '2px dashed grey',
                cursor: 'pointer',
              }}
              onClick={triggerStillInput}
            >
              {isLoadingStillUpload ? (
                <CircularProgress />
              ) : stillPreview ? (
                <img
                  src={stillPreview}
                  alt='عکس صحنه'
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <Box
                  sx={
                    {
                      /* Placeholder */
                    }
                  }
                >
                  <MovieFilterIcon />
                </Box>
              )}
            </Box>
            <input
              type='file'
              hidden
              ref={stillInputRef}
              onChange={handleStillChange}
              accept='image/*'
              disabled={currentLoading}
            />
          </Grid>
          {/* فیلدهای اطلاعات */}
          <Grid size={{ xs: 12 }}>
            {' '}
            <TextField
              label='عنوان قسمت'
              name='title'
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
              disabled={currentLoading}
            />{' '}
          </Grid>
          <Grid size={{ xs: 12 }}>
            {' '}
            <TextField
              label='توضیحات'
              name='overview'
              value={formData.overview}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              disabled={currentLoading}
            />{' '}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {' '}
            <DatePicker
              label='تاریخ پخش'
              value={formData.airDate}
              onChange={handleDateChange}
              slotProps={{ textField: { fullWidth: true } }}
              disabled={currentLoading}
            />{' '}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {' '}
            <TextField
              label='مدت زمان (دقیقه)'
              name='runtime'
              type='number'
              value={formData.runtime}
              onChange={handleChange}
              fullWidth
              disabled={currentLoading}
            />{' '}
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
          {isLoadingUpdate ? <CircularProgress size={24} /> : 'ذخیره قسمت'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
