// client/src/app/(admin)/admin/users/page.tsx
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  SelectChangeEvent,
} from '@mui/material';
import { GridPaginationModel } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add'; // برای دکمه افزودن کاربر جدید (آینده)
import FilterListIcon from '@mui/icons-material/FilterList';

import { AppDispatch, RootState } from '@/store/store';
import {
  fetchAdminUsers, // <-- Thunk واکشی کاربران
  selectAdminUserList,
  selectAdminUserPagination,
  selectAdminUserIsLoading,
  selectAdminUserError,
  clearUserAdminError,
  // TODO: Import block/unblock/delete/changeRole thunks later
} from '@/store/slices/userAdminSlice'; // <-- از userAdminSlice
import { selectCurrentUser } from '@/store/slices/authSlice';
import UserDataTable from '@/components/admin/UserDataTable'; // <-- ایمپورت جدول کاربران
import DeleteConfirmationDialog from '@/components/common/DeleteConfirmationDialog';
// TODO: Import BlockUserModal, ChangeRoleModal later
import { Role } from '@/types';

export default function AdminUsersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector(selectAdminUserList);
  const pagination = useSelector(selectAdminUserPagination);
  const isLoading = useSelector(selectAdminUserIsLoading);
  const error = useSelector(selectAdminUserError);
  const currentUser = useSelector(selectCurrentUser); // کاربر ادمین فعلی

  // --- State های محلی ---
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pagination?.pageSize || 10,
  });
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL'); // فیلتر نقش
  const [confirmDeleteState, setConfirmDeleteState] = useState<{
    open: boolean;
    userId: string | null;
  }>({ open: false, userId: null });
  const [blockModalState, setBlockModalState] = useState<{
    open: boolean;
    userId: string | null;
    isCurrentlyBlocked: boolean;
  }>({ open: false, userId: null, isCurrentlyBlocked: false });
  const [changeRoleModalState, setChangeRoleModalState] = useState<{
    open: boolean;
    userId: string | null;
    currentRole: Role | null;
  }>({ open: false, userId: null, currentRole: null });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });
  // ---------------------

  // تابع واکشی با فیلتر و pagination
  const loadUsers = useCallback(
    (model: GridPaginationModel, filter: Role | 'ALL') => {
      const params: any = { page: model.page + 1, limit: model.pageSize };
      if (filter !== 'ALL') {
        params.roleFilter = filter;
      }
      dispatch(fetchAdminUsers(params));
    },
    [dispatch]
  );

  // واکشی اولیه و هنگام تغییر pagination یا فیلتر
  useEffect(() => {
    loadUsers(paginationModel, roleFilter);
  }, [loadUsers, paginationModel, roleFilter]);

  // پاک کردن خطا
  useEffect(() => {
    return () => {
      dispatch(clearUserAdminError());
    };
  }, [dispatch]);

  // --- Handlers ---
  const handlePaginationModelChange = (newModel: GridPaginationModel) =>
    setPaginationModel(newModel);
  const handleRoleFilterChange = (event: SelectChangeEvent<Role | 'ALL'>) => {
    setRoleFilter(event.target.value as Role | 'ALL');
    // ریست کردن صفحه به ۰ هنگام تغییر فیلتر
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };
  const handleSnackbarClose = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  // Placeholder Handlers for Actions
  const handleBlockToggle = (id: string, currentStatus: boolean) => {
    console.log(
      'Toggle block status for user:',
      id,
      'Current blocked:',
      currentStatus
    );
    // TODO: Open block/unblock modal (maybe get reason for blocking)
    // setBlockModalState({ open: true, userId: id, isCurrentlyBlocked: currentStatus });
    setSnackbar({
      open: true,
      message: `عملیات مسدود/رفع مسدودیت برای ${id} (هنوز پیاده‌سازی نشده)`,
      severity: 'info',
    });
  };

  const handleDeleteUser = (id: string) => {
    console.log('Delete user requested:', id);
    setConfirmDeleteState({ open: true, userId: id });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteState.userId) return;
    const userIdToDelete = confirmDeleteState.userId;
    setConfirmDeleteState({ open: false, userId: null }); // بستن دیالوگ
    console.log('Confirming delete for user:', userIdToDelete);
    // TODO: Dispatch deleteUser thunk
    // try { await dispatch(deleteUser(userIdToDelete)).unwrap(); setSnackbar... } catch { setSnackbar... }
    setSnackbar({
      open: true,
      message: `حذف کاربر ${userIdToDelete} (هنوز پیاده‌سازی نشده)`,
      severity: 'info',
    });
  };
  const handleCloseConfirmDialog = () =>
    setConfirmDeleteState({ open: false, userId: null });

  const handleChangeRole = (id: string, currentRole: Role) => {
    console.log(
      'Change role requested for user:',
      id,
      'Current role:',
      currentRole
    );
    // TODO: Open change role modal
    // setChangeRoleModalState({ open: true, userId: id, currentRole });
    setSnackbar({
      open: true,
      message: `تغییر نقش کاربر ${id} (هنوز پیاده‌سازی نشده)`,
      severity: 'info',
    });
  };
  // --------------------

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography
          variant='h4'
          sx={{ fontWeight: 'bold' }}
        >
          مدیریت کاربران
        </Typography>
        {/* TODO: Add Button for adding new admin/user? */}
      </Box>

      {/* --- بخش فیلترها --- */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(40, 40, 40, 0.5)' }}>
        <Grid
          container
          spacing={2}
          alignItems='flex-end'
        >
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl
              fullWidth
              size='small'
              variant='outlined'
            >
              <InputLabel
                id='role-filter-label'
                sx={{ color: 'grey.400' }}
              >
                فیلتر بر اساس نقش
              </InputLabel>
              <Select
                labelId='role-filter-label'
                value={roleFilter}
                onChange={handleRoleFilterChange}
                label='فیلتر بر اساس نقش'
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '& .MuiSvgIcon-root': { color: 'grey.400' },
                }}
              >
                {/* سوپر ادمین همه نقش‌ها را می‌بیند، ادمین فقط می‌تواند USER را ببیند (API هندل می‌کند) */}
                <MenuItem value={'ALL'}>همه نقش‌ها (مجاز)</MenuItem>
                <MenuItem value={Role.USER}>کاربر عادی (USER)</MenuItem>
                {currentUser?.role === Role.SUPER_ADMIN && (
                  <MenuItem value={Role.ADMIN}>ادمین (ADMIN)</MenuItem>
                )}
                {currentUser?.role === Role.SUPER_ADMIN && (
                  <MenuItem value={Role.SUPER_ADMIN}>
                    سوپر ادمین (SUPER_ADMIN)
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid>
            {/* TODO: Add search input */}
            <TextField
              fullWidth
              label='جستجو (نام/ایمیل)...'
              size='small'
              variant='outlined'
              disabled /* ... */
              InputLabelProps={{ sx: { color: 'grey.400' } }}
              sx={{
                input: { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              variant='outlined'
              startIcon={<FilterListIcon />}
              disabled
            >
              اعمال فیلتر
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {/* ----------------- */}

      {error && (
        <Alert
          severity='error'
          sx={{ mb: 2 }}
          onClose={() => dispatch(clearUserAdminError())}
        >
          {' '}
          {error.message || 'خطا در واکشی کاربران'}{' '}
        </Alert>
      )}

      <UserDataTable
        users={users}
        isLoading={isLoading}
        rowCount={pagination?.totalRowCount || 0}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        onBlockToggle={handleBlockToggle}
        onDelete={handleDeleteUser}
        onChangeRole={
          currentUser?.role === Role.SUPER_ADMIN ? handleChangeRole : undefined
        } // فقط سوپر ادمین می‌تواند نقش را تغییر دهد
        currentUser={currentUser}
      />

      {/* دیالوگ تایید حذف */}
      <DeleteConfirmationDialog
        open={confirmDeleteState.open}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        title='تایید حذف کاربر'
        message={`آیا از حذف این کاربر اطمینان دارید؟ این عمل باعث حذف تمام اطلاعات مرتبط با او (مثل نظرات، امتیازها و...) خواهد شد.`}
        isLoading={isLoading} // یا isLoadingCreateUpdate اگر جدا شد
      />

      {/* TODO: Add Block Reason Modal */}
      {/* TODO: Add Change Role Modal */}

      {/* Snackbar برای پیام‌های موفقیت/خطا */}
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
