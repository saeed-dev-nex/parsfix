'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  SelectChangeEvent,
  Box,
  Typography,
} from '@mui/material';
import { Role, User } from '@/types';

interface ChangeRoleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (newRole: Role) => void; // فقط نقش جدید را می‌فرستد
  isLoading: boolean;
  user: User | null; // کاربری که نقشش تغییر می‌کند
}

export default function ChangeRoleModal({
  open,
  onClose,
  onSubmit,
  isLoading,
  user,
}: ChangeRoleModalProps) {
  // نقش‌های قابل انتخاب (سوپر ادمین قابل انتخاب نیست)
  const availableRoles = [Role.USER, Role.ADMIN];
  const [selectedRole, setSelectedRole] = useState<Role>(Role.USER);

  useEffect(() => {
    // تنظیم نقش اولیه هنگام باز شدن مودال
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleChange = (event: SelectChangeEvent<Role>) => {
    setSelectedRole(event.target.value as Role);
  };

  const handleSubmit = () => {
    onSubmit(selectedRole);
  };

  // ریست نقش هنگام بسته شدن
  useEffect(() => {
    if (!open && user) {
      setSelectedRole(user.role); // برگردان به نقش فعلی کاربر
    }
  }, [open, user]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='xs'
      fullWidth
    >
      <DialogTitle>تغییر نقش کاربر</DialogTitle>
      <DialogContent>
        <Typography
          variant='body1'
          gutterBottom
        >
          تغییر نقش برای: <strong>{user?.name || user?.email}</strong>
        </Typography>
        <Typography
          variant='body2'
          color='textSecondary'
          gutterBottom
        >
          نقش فعلی: {user?.role}
        </Typography>
        <FormControl
          fullWidth
          margin='normal'
          variant='outlined'
          disabled={isLoading}
        >
          <InputLabel id='change-role-select-label'>نقش جدید</InputLabel>
          <Select
            labelId='change-role-select-label'
            value={selectedRole}
            onChange={handleChange}
            label='نقش جدید'
          >
            {availableRoles.map((roleValue) => (
              <MenuItem
                key={roleValue}
                value={roleValue}
              >
                {roleValue === Role.ADMIN ? 'ادمین' : 'کاربر عادی'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
          disabled={isLoading || selectedRole === user?.role}
          variant='contained'
          color='primary'
        >
          {isLoading ? (
            <CircularProgress
              size={24}
              color='inherit'
            />
          ) : (
            'تایید و تغییر نقش'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
