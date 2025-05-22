// client/src/app/(admin)/admin/series/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  TextField,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { GridPaginationModel } from '@mui/x-data-grid';

import { AppDispatch, RootState } from '@/store/store';
import {
  fetchSeries, // <-- Thunk سریال
  selectAllAdminSeries,
  selectSeriesPaginationData,
  selectSeriesIsLoading,
  selectSeriesError,
  clearSeriesError,
  selectSeriesSuccessMessage,
  clearSeriesSuccessMessage,
  deleteSeries,
  selectSeriesIsProcessing,
} from '@/store/slices/seriesSlice'; // <-- از seriesSlice
import { selectCurrentUser } from '@/store/slices/authSlice';
import SeriesDataTable from '@/components/admin/SeriesDataTable'; // <-- جدول سریال

import { Role } from '@/types';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import AddSeriesModal from '@/components/admin/series/AddSeriesModal';
import EditSeriesModal from '@/components/admin/series/EditSeriesModal';
import DeleteConfirmationDialog from '@/components/common/DeleteConfirmationDialog';
import { useRouter } from 'next/navigation';

export default function AdminSeriesPage() {
  useAuthProtection({ allowedRoles: [Role.ADMIN, Role.SUPER_ADMIN] }); // محافظت صفحه
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const seriesList = useSelector(selectAllAdminSeries);
  const pagination = useSelector(selectSeriesPaginationData);
  const isLoading = useSelector(selectSeriesIsLoading);
  const isProcessing = useSelector(selectSeriesIsProcessing);
  const error = useSelector(selectSeriesError);
  const currentUser = useSelector(selectCurrentUser);
  const successMessage = useSelector(selectSeriesSuccessMessage);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pagination?.pageSize || 10,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModalState, setEditModalState] = useState<{
    open: boolean;
    seriesId: string | null;
  }>({
    open: false,
    seriesId: null,
  });
  const [confirmDeleteState, setConfirmDeleteState] = useState<{
    open: boolean;
    seriesId: string | null;
  }>({
    open: false,
    seriesId: null,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const loadSeries = useCallback(
    (model: GridPaginationModel) => {
      dispatch(fetchSeries({ page: model.page + 1, limit: model.pageSize }));
    },
    [dispatch]
  );

  useEffect(() => {
    loadSeries(paginationModel);
  }, [loadSeries, paginationModel]);
  useEffect(() => {
    setPaginationModel((prev) => ({
      ...prev,
      pageSize: pagination?.pageSize || 10,
    }));
  }, [pagination?.pageSize]);
  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
      dispatch(clearSeriesError());
    }
    if (successMessage) {
      setSnackbar({ open: true, message: successMessage, severity: 'success' });
      dispatch(clearSeriesSuccessMessage());
    }
  }, [error, successMessage, dispatch]);
  useEffect(() => {
    return () => {
      dispatch(clearSeriesError());
      dispatch(clearSeriesSuccessMessage());
    };
  }, [dispatch]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    // TODO: Implement search functionality
  };

  const handleRefresh = () => {
    loadSeries(paginationModel);
  };

  // --- Handlers ---
  const handlePaginationModelChange = (newModel: GridPaginationModel) =>
    setPaginationModel(newModel);
  const handleSnackbarClose = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  // Add Handlers
  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);
  const handleAddSeriesSuccess = () => {
    handleCloseAddModal();
    loadSeries(paginationModel);
  };

  // --- Edit Handlers ---
  const handleEditSeries = (id: string) =>
    setEditModalState({ open: true, seriesId: id });
  const handleCloseEditModal = () =>
    setEditModalState({ open: false, seriesId: null });
  const handleUpdateSeriesSuccess = () => {
    handleCloseEditModal();
    loadSeries(paginationModel);
  };
  // --------------------

  // --- Delete Handlers ---
  const handleDeleteSeries = (id: string) =>
    setConfirmDeleteState({ open: true, seriesId: id });
  const handleCloseConfirmDialog = () =>
    setConfirmDeleteState({ open: false, seriesId: null });
  const handleConfirmDelete = async () => {
    if (!confirmDeleteState.seriesId) return;
    await dispatch(deleteSeries(confirmDeleteState.seriesId));
    handleCloseConfirmDialog();
    // پیام موفقیت/خطا توسط useEffect بالا نمایش داده می‌شود
  };
  // ----------------------

  // --- View Handler (Placeholder) ---
  const handleViewSeries = (id: string) => {
    router.push(`/admin/series/edit/${id}`);
  };
  // ---------------------------------

  return (
    <Box sx={{ p: 3 }}>
      <Card
        elevation={0}
        sx={{
          mb: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography
              variant='h4'
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              مدیریت سریال‌ها
              {isLoading && (
                <CircularProgress
                  size={24}
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title='بارگذاری مجدد'>
                <IconButton
                  onClick={handleRefresh}
                  disabled={isLoading}
                  sx={{ color: 'primary.main' }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant='contained'
                startIcon={<AddIcon />}
                onClick={handleOpenAddModal}
                disabled={isLoading}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                }}
              >
                افزودن سریال جدید
              </Button>
            </Box>
          </Box>

          <Grid
            container
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Grid size={{ xs: 12, md: 9 }}>
              <TextField
                fullWidth
                placeholder='جستجو در سریال‌ها...'
                value={searchQuery}
                onChange={handleSearch}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <SearchIcon color='action' />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'background.default',
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                fullWidth
                variant='outlined'
                startIcon={<FilterListIcon />}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                فیلترها
              </Button>
            </Grid>
          </Grid>

          {error && (
            <Alert
              severity='error'
              onClose={() => dispatch(clearSeriesError())}
              sx={{ mb: 2, borderRadius: 2 }}
            >
              {error.message || 'خطا در واکشی سریال‌ها'}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <SeriesDataTable
          seriesList={seriesList}
          isLoading={isLoading}
          rowCount={pagination?.totalRowCount || 0}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          onEdit={handleEditSeries}
          onDelete={handleDeleteSeries}
          onView={handleViewSeries}
          currentUserRole={currentUser?.role}
          currentUserId={currentUser?.id}
        />
      </Paper>
      <AddSeriesModal
        open={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={handleAddSeriesSuccess}
      />
      {editModalState.seriesId && (
        <EditSeriesModal
          open={editModalState.open}
          seriesId={editModalState.seriesId}
          onClose={handleCloseEditModal}
          onSuccess={handleUpdateSeriesSuccess}
        />
      )}
      <DeleteConfirmationDialog
        open={confirmDeleteState.open}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        title='تایید حذف سریال'
        message='آیا از حذف این سریال و تمام فصل‌ها و قسمت‌های مرتبط با آن اطمینان دارید؟ این عمل قابل بازگشت نیست.'
        isLoading={isProcessing}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
