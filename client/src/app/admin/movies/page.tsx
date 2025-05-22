'use client';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MoviesDataTable from '@/components/admin/Movies/MovieDataTable';
import { Typography, Box, Button, Alert, Snackbar } from '@mui/material';
import {
  fetchMovies,
  selectAllMovies,
  selectMoviePaginationData,
  selectMovieError,
  clearMovieError,
  deleteMovie,
  selectMovieIsLoadingList,
} from '@/store/slices/movieSlice';
import MovieDataTable from '@/components/admin/Movies/MovieDataTable';
import { AppDispatch } from '@/store/store';
import { Add } from '@mui/icons-material';
import { GridPaginationModel } from '@mui/x-data-grid';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { Role } from '@/types';
import AddMovieModal from '@/components/admin/Movies/AddMovieModal';
import DeleteConfirmationDialog from '@/components/common/DeleteConfirmationDialog';
import EditMovieModal from '@/components/admin/Movies/EditMovieModal';
export default function AdminMoviesPage() {
  // ----------------------- hooks -------------------
  const dispatch = useDispatch<AppDispatch>();
  const movies = useSelector(selectAllMovies);
  const pagination = useSelector(selectMoviePaginationData);
  const isLoading = useSelector(selectMovieIsLoadingList);
  const error = useSelector(selectMovieError);
  const currentUser = useSelector(selectCurrentUser);
  // ------------------------ Local States -------------------
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0, // صفحه اول در DataGrid ایندکس 0 دارد
    pageSize: pagination.pageSize || 10, // اندازه صفحه پیش‌فرض
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // --- State برای مودال و دیالوگ ---

  // State جدید برای دیالوگ تایید حذف
  const [confirmDeleteState, setConfirmDeleteState] = useState<{
    open: boolean;
    movieId: string | null;
  }>({ open: false, movieId: null });
  // State برای Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  // for edit Movie
  const [editModalState, setEditModalState] = useState<{
    open: boolean;
    movieId: string | null;
  }>({ open: false, movieId: null });
  // تابع برای واکشی داده‌ها بر اساس pagination

  // --------------------------- Handle Effects --------------------
  const loadMovies = useCallback(
    (model: GridPaginationModel) => {
      dispatch(fetchMovies({ page: model.page + 1, limit: model.pageSize }));
    },
    [dispatch]
  );

  // واکشی اولیه هنگام mount شدن کامپوننت
  useEffect(() => {
    loadMovies(paginationModel);
  }, [loadMovies, paginationModel]); // اجرای مجدد در صورت تغییر مدل pagination

  // پاک کردن خطا هنگام خروج
  useEffect(() => {
    return () => {
      dispatch(clearMovieError());
    };
  }, [dispatch]);
  // -------------------------------------------------------
  // ------------------ Events Handlers ----------------------
  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    console.log('Pagination Change:', newModel);
    // آپدیت state محلی که باعث اجرای مجدد useEffect بالا و واکشی داده جدید می‌شود
    setPaginationModel(newModel);
  };
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false); // بستن مودال
  };

  // CRUD MOVIE HANDLERS
  const handleAddMovie = () => {
    setIsAddModalOpen(true); // باز کردن مودال
  };
  const handleAddMovieSuccess = () => {
    console.log('Movie added successfully, refreshing list...');
    handleCloseAddModal(); // <-- بستن مودال
    loadMovies(paginationModel); // <-- رفرش کردن لیست (واکشی مجدد صفحه فعلی)
    // لیست را دوباره واکشی کن تا فیلم جدید نمایش داده شود

    // onClose به صورت خودکار در مودال صدا زده می‌شود و مودال بسته می‌شود
  };
  // --- توابع مربوط به حذف ---
  const handleDeleteMovie = (id: string) => {
    console.log('Delete movie requested:', id);
    // ذخیره ID فیلم و باز کردن دیالوگ تایید
    setConfirmDeleteState({ open: true, movieId: id });
  };
  const handleUpdateMovieSuccess = () => {
    console.log('Movie updated successfully, refreshing list...');
    handleCloseEditModal(); // بستن مودال ویرایش
    loadMovies(paginationModel); // رفرش کردن لیست
    // نمایش Snackbar موفقیت (اگر در مودال مدیریت نشده باشد)
  };

  const handleViewMovie = (id: string) => {
    console.log('View movie clicked:', id);
    // TODO: Implement view movie functionality
  };
  // ------------------
  // Confirm Dialog Modal Handlers

  const handleConfirmDelete = async () => {
    if (!confirmDeleteState.movieId) return;

    console.log('Confirming delete for movie:', confirmDeleteState.movieId);
    const movieIdToDelete = confirmDeleteState.movieId;
    handleCloseConfirmDialog(); // بستن دیالوگ

    try {
      // Dispatch کردن thunk حذف و انتظار برای نتیجه با unwrap
      await dispatch(deleteMovie(movieIdToDelete)).unwrap();
      // نمایش پیام موفقیت
      setSnackbar({
        open: true,
        message: 'فیلم با موفقیت حذف شد.',
        severity: 'success',
      });
      // نیازی به رفرش دستی نیست چون reducer state را آپدیت می‌کند
      // loadMovies(paginationModel);
    } catch (err: any) {
      console.error('Delete failed:', err);
      // نمایش پیام خطا از rejectWithValue
      setSnackbar({
        open: true,
        message: err.message || 'خطا در حذف فیلم.',
        severity: 'error',
      });
    }
  };
  const handleCloseConfirmDialog = () => {
    // بستن دیالوگ تایید
    setConfirmDeleteState({ open: false, movieId: null });
  };

  // -------------------------
  // Edit movie Handlers
  const handleEditMovie = (id: string) => {
    console.log('Edit movie clicked:', id);
    setEditModalState({ open: true, movieId: id });
  };
  const handleCloseEditModal = () => {
    setEditModalState({ open: false, movieId: null });
  };
  // -------------------------
  // SnackBar Handlers
  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  // -------------------
  return (
    <Box
      sx={{
        p: 4,
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, rgba(10, 10, 10, 0.97), rgba(15, 15, 15, 0.95))',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          p: { xs: 2, md: 3 },
          borderRadius: '16px',
          background:
            'linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(30, 30, 30, 0.9))',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background:
              'radial-gradient(circle at top right, rgba(229, 9, 20, 0.15), transparent 60%)',
            zIndex: 0,
          },
        }}
      >
        <Typography
          variant='h4'
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #e50914, #ff5f65)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
            position: 'relative',
            zIndex: 1,
            textShadow: '0 2px 10px rgba(229, 9, 20, 0.3)',
            fontSize: { xs: '1.75rem', md: '2.25rem' },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -5,
              left: 0,
              width: '40%',
              height: '3px',
              background: 'linear-gradient(to right, #e50914, transparent)',
              borderRadius: '3px',
            },
          }}
        >
          مدیریت فیلم‌ها
        </Typography>
        <Button
          variant='contained'
          startIcon={<Add />}
          onClick={handleAddMovie}
          disabled={isLoading}
          sx={{
            background: 'linear-gradient(45deg, #e50914, #ff3d47)',
            color: 'white',
            borderRadius: '12px',
            px: { xs: 2, md: 3 },
            py: 1,
            fontWeight: 'bold',
            fontSize: { xs: '0.85rem', md: '0.95rem' },
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(229, 9, 20, 0.3)',
            position: 'relative',
            zIndex: 1,
            '&:hover': {
              background: 'linear-gradient(45deg, #b30710, #e50914)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(229, 9, 20, 0.4)',
            },
            '&:disabled': {
              background: 'rgba(229, 9, 20, 0.5)',
              color: 'rgba(255, 255, 255, 0.5)',
            },
          }}
        >
          افزودن فیلم جدید
        </Button>
      </Box>

      {/* نمایش خطا */}
      {error && (
        <Alert
          severity='error'
          sx={{
            mb: 3,
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            '& .MuiAlert-icon': {
              color: '#e50914',
            },
            '& .MuiAlert-message': {
              fontWeight: 'medium',
            },
          }}
          onClose={() => dispatch(clearMovieError())}
        >
          {error.message || 'خطا در واکشی اطلاعات'}
        </Alert>
      )}

      {/* نمایش جدول */}
      <MovieDataTable
        movies={movies}
        isLoading={isLoading}
        rowCount={pagination.totalRowCount}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        onEdit={handleEditMovie} // <-- اتصال handler ویرایش
        onDelete={handleDeleteMovie}
        currentUserRole={currentUser?.role as Role}
        currentUserId={currentUser?.id}
        onView={handleViewMovie}
      />
      {/* --- رندر کردن مودال --- */}
      <AddMovieModal
        open={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={handleAddMovieSuccess} // پاس دادن تابع برای اجرا پس از موفقیت
      />
      {/* --------------------- */}

      {/* --- رندر کردن دیالوگ تایید حذف --- */}
      <DeleteConfirmationDialog
        open={confirmDeleteState.open}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        title='تایید حذف فیلم'
        message={`آیا از حذف این فیلم اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
        isLoading={isLoading} // از isLoading عمومی استفاده می‌کنیم فعلا
      />
      {/* ------------------------------- */}
      {editModalState.movieId && ( // فقط اگر movieId وجود داشت رندر کن
        <EditMovieModal
          open={editModalState.open}
          movieId={editModalState.movieId} // پاس دادن ID به مودال
          onClose={handleCloseEditModal}
          onSuccess={handleUpdateMovieSuccess}
        />
      )}
      {/* Snackbar برای پیام‌های موفقیت/خطا */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
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
