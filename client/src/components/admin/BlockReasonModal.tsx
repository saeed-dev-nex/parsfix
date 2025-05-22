import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';

interface BlockReasonModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void; // تابعی که دلیل را می‌گیرد
  isLoading: boolean;
}

export default function BlockReasonModal({
  open,
  onClose,
  onSubmit,
  isLoading,
}: BlockReasonModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    onSubmit(reason.trim()); // دلیل را به والد می‌فرستد
  };

  // ریست کردن دلیل هنگام بسته شدن
  React.useEffect(() => {
    if (!open) {
      setReason('');
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='xs'
      fullWidth
    >
      <DialogTitle>دلیل مسدودیت</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin='dense'
          id='block-reason'
          label='دلیل مسدود کردن کاربر (اختیاری)'
          type='text'
          fullWidth
          variant='outlined'
          multiline
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isLoading}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={isLoading}
          color='inherit'
        >
          انصراف
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          variant='contained'
          color='error'
        >
          {isLoading ? (
            <CircularProgress
              size={24}
              color='inherit'
            />
          ) : (
            'مسدود کن'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
