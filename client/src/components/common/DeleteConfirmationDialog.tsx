import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import React from 'react';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean; // وضعیت لودینگ برای دکمه تایید (اختیاری)
}

export default function DeleteConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      PaperProps={{
        sx: { bgcolor: 'background.paper', color: 'text.primary' },
      }} // استایل برای تم تیره
    >
      <DialogTitle
        id='alert-dialog-title'
        sx={{ fontWeight: 'bold' }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          id='alert-dialog-description'
          sx={{ color: 'text.secondary' }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        {/* دکمه لغو onClose را صدا می‌زند */}
        <Button
          onClick={onClose}
          disabled={isLoading}
          color='inherit'
        >
          لغو
        </Button>
        {/* دکمه تایید onConfirm را صدا می‌زند */}
        <Button
          onClick={onConfirm}
          color='error' // رنگ قرمز برای عملیات خطرناک
          variant='contained'
          autoFocus
          disabled={isLoading}
          startIcon={
            isLoading ? (
              <CircularProgress
                size={16}
                color='inherit'
              />
            ) : null
          }
        >
          {isLoading ? 'در حال حذف...' : 'تایید و حذف'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
