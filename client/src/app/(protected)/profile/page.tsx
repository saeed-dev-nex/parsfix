// client/src/app/(protected)/profile/page.tsx
'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  ChangeEvent,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import { styled, useTheme } from '@mui/material/styles';

import { useAuthProtection } from '@/hooks/useAuthProtection'; // هوک محافظت
import { RootState, AppDispatch } from '@/store/store';
import { selectCurrentUser } from '@/store/slices/authSlice'; // خواندن کاربر از authSlice
import {
  updateUserProfile, // <-- از profileSlice
  uploadProfilePicture, // <-- از profileSlice
  selectProfileIsLoadingUpdate,
  selectProfileIsLoadingImageUpload,
  selectProfileError,
  selectProfileSuccessMessage,
  clearProfileError,
  clearProfileSuccessMessage,
} from '@/store/slices/profileSlice'; // <-- ایمپورت‌های مربوط به profileSlice
import { Gender, User, UpdateUserProfileData } from '@/types'; // تایپ‌های لازم

// --- استایل‌ها ---
const EditProfilePaper = styled(Paper)(({ theme }) => ({
  /* ... */
}));
const StyledTextField = styled(TextField)(({ theme }) => ({
  /* ... */
}));
// --- پایان استایل‌ها ---

// اینترفیس فرم محلی
interface UserProfileFormData {
  name: string;
  dateOfBirth: Date | null;
  gender: Gender | '';
}
const initialFormData: UserProfileFormData = {
  name: '',
  dateOfBirth: null,
  gender: '',
};

export default function ProfileInfoPage() {
  // --- Hooks ---
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { isLoading: isAuthLoading, currentUser } = useAuthProtection(); // محافظت و گرفتن کاربر از authSlice
  // --- خواندن state های مربوط به عملیات پروفایل از profileSlice ---
  const isLoadingUpdate = useSelector(selectProfileIsLoadingUpdate);
  const isLoadingImageUpload = useSelector(selectProfileIsLoadingImageUpload);
  const profileError = useSelector(selectProfileError);
  const profileSuccessMessage = useSelector(selectProfileSuccessMessage);
  // --------------------------------------------------------------

  // --- Local State ---
  const [formData, setFormData] =
    useState<UserProfileFormData>(initialFormData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // فقط برای عکس پروفایل
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });
  // Refs for initial values
  const initialFormStateRef = useRef<UserProfileFormData>(initialFormData);
  // --------------------

  // مقداردهی اولیه فرم و پیش‌نمایش عکس
  useEffect(() => {
    if (currentUser) {
      const initialData: UserProfileFormData = {
        name: currentUser.name || '',
        dateOfBirth: currentUser.dateOfBirth
          ? new Date(currentUser.dateOfBirth)
          : null,
        gender: currentUser.gender || '',
      };
      setFormData(initialData);
      setPreviewUrl(currentUser.profilePictureUrl || null); // استفاده از عکس پروفایل کاربر
      initialFormStateRef.current = initialData; // ذخیره مقادیر اولیه
    }
    // پاک کردن پیام‌ها/خطاها هنگام mount یا تغییر کاربر
    dispatch(clearProfileError());
    dispatch(clearProfileSuccessMessage());

    // Cleanup preview URL
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      dispatch(clearProfileError()); // پاک کردن هنگام unmount
      dispatch(clearProfileSuccessMessage());
    };
    // previewUrl نباید در وابستگی باشد
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, dispatch]);

  // نمایش Snackbar بر اساس پیام‌های Redux
  useEffect(() => {
    if (profileError) {
      setSnackbar({
        open: true,
        message: profileError.message,
        severity: 'error',
      });
    }
    if (profileSuccessMessage) {
      setSnackbar({
        open: true,
        message: profileSuccessMessage,
        severity: 'success',
      });
    }
  }, [profileError, profileSuccessMessage]);

  // محاسبه isFormDirty
  const isFormDirty = useMemo(() => {
    const initialForm = initialFormStateRef.current;
    let changed = false;
    if (formData.name.trim() !== initialForm.name.trim()) changed = true;
    if (
      (formData.dateOfBirth?.toISOString() ?? null) !==
      (initialForm.dateOfBirth?.toISOString() ?? null)
    )
      changed = true;
    if (formData.gender !== initialForm.gender) changed = true;
    return changed;
  }, [formData]);

  // --- Handlers ---
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name: fieldName, value } = e.target;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleDateChange = (newValue: Date | null) => {
    setFormData((prev) => ({ ...prev, dateOfBirth: newValue }));
  };

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // ... (ولیدیشن فایل) ...
    setSelectedFile(file); // ذخیره فایل برای ارسال احتمالی (اگر آپلود فوری نباشد)
    const objectUrl = URL.createObjectURL(file);
    if (previewUrl && previewUrl.startsWith('blob:'))
      URL.revokeObjectURL(previewUrl);
    setPreviewUrl(objectUrl);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // --- Dispatch آپلود عکس پروفایل کاربر ---
    // فرض می‌کنیم آپلود بلافاصله انجام می‌شود
    dispatch(clearProfileError()); // پاک کردن خطای قبلی
    dispatch(clearProfileSuccessMessage());
    try {
      await dispatch(uploadProfilePicture(file)).unwrap();
      // پیام موفقیت توسط useEffect بالا و سلکتور نمایش داده می‌شود
      setSelectedFile(null); // پاک کردن فایل پس از آپلود موفق
    } catch (err) {
      // خطا توسط useEffect بالا و سلکتور نمایش داده می‌شود
      // برگرداندن پیش‌نمایش به عکس قبلی
      setPreviewUrl(currentUser?.profilePictureUrl || null);
      setSelectedFile(null);
    }
    // -------------------------------------
  };

  const handleSaveChanges = async () => {
    if (!currentUser || !formData.name.trim()) {
      /*...*/ setSnackbar({
        open: true,
        message: 'نام الزامی است',
        severity: 'warning',
      });
      return;
    }
    dispatch(clearProfileError());
    dispatch(clearProfileSuccessMessage());

    const updateData: UpdateUserProfileData = {
      name: formData.name.trim(),
      // ارسال تاریخ به فرمتی که سرور انتظار دارد (مثلا ISO)
      dateOfBirth: formData.dateOfBirth
        ? formData.dateOfBirth.toISOString()
        : null,
      gender: formData.gender || null,
    };

    // حذف فیلدهایی که null هستند اگر سرور انتظار ندارد
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof UpdateUserProfileData] === null) {
        delete updateData[key as keyof UpdateUserProfileData];
      }
    });

    const resultAction = await dispatch(updateUserProfile(updateData));

    if (updateUserProfile.fulfilled.match(resultAction)) {
      setIsEditing(false); // خروج از حالت ویرایش
      // پیام موفقیت توسط useEffect نمایش داده می‌شود
    }
    // خطا هم توسط useEffect نمایش داده می‌شود
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    const initialData = initialFormStateRef.current;
    setFormData(initialData);
    setPreviewUrl(currentUser?.profilePictureUrl || null); // ریست پیش‌نمایش عکس
    setSelectedFile(null); // پاک کردن فایل انتخاب شده
    dispatch(clearProfileError());
    dispatch(clearProfileSuccessMessage());
  };

  const handleSnackbarClose = (/* ... */) =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  // --- Render Logic ---
  if (isAuthLoading || !currentUser) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 64px)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const currentLoading = isLoadingUpdate || isLoadingImageUpload; // وضعیت لودینگ کلی

  return (
    <Box>
      <Typography
        variant='h5'
        gutterBottom
        sx={{ fontWeight: 'bold', mb: 3 }}
      >
        پروفایل کاربری
      </Typography>
      {/* نمایش خطای کلی profileSlice */}
      {profileError && snackbar.open && snackbar.severity === 'error' && (
        <Alert
          severity='error'
          sx={{ mb: 2 }}
          onClose={() => dispatch(clearProfileError())}
        >
          {profileError.message}
        </Alert>
      )}

      <EditProfilePaper>
        <Grid
          container
          spacing={3}
          alignItems='flex-start'
        >
          {/* بخش آواتار */}
          <Grid
            size={{ xs: 12, md: 9 }}
            sx={{ textAlign: 'center' }}
          >
            <Box
              sx={{
                position: 'relative',
                display: 'inline-block',
                cursor: isEditing ? 'pointer' : 'default',
                '&:hover': isEditing
                  ? { boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)' }
                  : {},
                transition: 'box-shadow 0.3s ease-in-out',
              }}
              onClick={handleAvatarClick}
            >
              <Avatar
                sx={{
                  width: { xs: 80, sm: 100, md: 120 },
                  height: { xs: 80, sm: 100, md: 120 },
                  mb: 1,
                  border: isEditing ? '3px dashed grey' : '2px solid white',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'border 0.3s ease-in-out',
                  '&:hover': isEditing ? { border: '3px dashed #1976d2' } : {},
                }}
                src={previewUrl || undefined}
                alt={currentUser.name || currentUser.email || ''}
              >
                {/* Fallback Icon */}
                {!previewUrl && (
                  <PersonOutlineIcon
                    sx={{ fontSize: { xs: 40, sm: 50, md: 60 } }}
                  />
                )}
              </Avatar>
              {isEditing && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    borderRadius: '50%',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                    transition: 'background-color 0.3s ease-in-out',
                  }}
                >
                  <PhotoCameraIcon
                    sx={{
                      color: 'white',
                      fontSize: { xs: 20, sm: 24, md: 28 },
                    }}
                  />
                </Box>
              )}
            </Box>
            <input
              type='file'
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
              accept='image/*'
            />
            {/* نمایش لودینگ آپلود عکس */}
            {isLoadingImageUpload && (
              <CircularProgress
                size={20}
                sx={{ display: 'block', margin: '8px auto' }}
              />
            )}
          </Grid>

          {/* بخش اطلاعات متنی */}
          <Grid size={{ xs: 12, md: 9 }}>
            <StyledTextField
              label='نام و نام خانوادگی'
              name='name'
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing || currentLoading}
              fullWidth
              required
              variant='outlined'
            />
            <StyledTextField
              label='ایمیل'
              value={currentUser.email || ''}
              disabled
              fullWidth
              variant='outlined'
            />
            <DatePicker
              label='تاریخ تولد (شمسی)'
              value={formData.dateOfBirth}
              onChange={handleDateChange}
              disabled={!isEditing || currentLoading}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  sx: { mb: 2.5 },
                },
              }}
            />
            <FormControl
              fullWidth
              variant='outlined'
              sx={{ mb: 2.5 }}
              disabled={!isEditing || currentLoading}
            >
              <InputLabel id='gender-label'>جنسیت</InputLabel>
              <Select
                labelId='gender-label'
                name='gender'
                value={formData.gender}
                onChange={handleChange}
                label='جنسیت'
              >
                <MenuItem value=''>
                  <em>انتخاب نشده</em>
                </MenuItem>
                <MenuItem value={'MALE'}>مرد</MenuItem>
                {/* ... سایر گزینه‌ها ... */}
              </Select>
            </FormControl>

            <Box sx={{ mt: 2, textAlign: 'right' }}>
              {isEditing ? (
                <>
                  <Button
                    variant='outlined'
                    onClick={handleCancelEdit}
                    sx={{ mr: 1 }}
                    disabled={currentLoading}
                  >
                    لغو
                  </Button>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={handleSaveChanges}
                    startIcon={<SaveIcon />}
                    disabled={currentLoading || !isFormDirty}
                  >
                    {isLoadingUpdate ? (
                      <CircularProgress
                        size={24}
                        color='inherit'
                      />
                    ) : (
                      'ذخیره تغییرات'
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  variant='contained'
                  onClick={() => setIsEditing(true)}
                  startIcon={<EditIcon />}
                  color='inherit'
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                  }}
                >
                  ویرایش اطلاعات
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </EditProfilePaper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
