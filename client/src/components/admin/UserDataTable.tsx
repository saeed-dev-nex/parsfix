"use client";

import React from 'react';
import { DataGrid, GridColDef, GridPaginationModel, GridActionsCellItem, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip, Chip, Avatar, ChipProps } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; // برای تغییر نقش احتمالی
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import NoAccountsIcon from '@mui/icons-material/NoAccounts';

import { User, Role } from '@/types';

interface UserDataTableProps {
  users: User[];
  isLoading: boolean;
  rowCount: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onBlockToggle: (id: string, currentStatus: boolean, reason?: string) => void; // برای مسدود/رفع مسدودیت
  onDelete: (id: string) => void;
  onChangeRole?: (id: string, currentRole: Role) => void; // برای تغییر نقش (اختیاری)
  currentUser?: User | null; // کاربر ادمین لاگین کرده
}

// تایپ ردیف
interface UserRow extends User {}

export default function UserDataTable({
  users, isLoading, rowCount, paginationModel, onPaginationModelChange,
  onBlockToggle, onDelete, onChangeRole, currentUser
}: UserDataTableProps) {

  const columns: GridColDef<UserRow>[] = [
    {
        field: 'profilePictureUrl', headerName: 'عکس', width: 70, sortable: false, filterable: false,
        renderCell: (params) => (
            <Avatar src={params.value || undefined} sx={{width: 36, height: 36}}>
                <PersonOutlineIcon />
            </Avatar>
        )
    },
    { field: 'name', headerName: 'نام', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'ایمیل', flex: 1, minWidth: 200 },
    {
        field: 'role', headerName: 'نقش', width: 120, align: 'center', headerAlign: 'center',
        renderCell: (params) => {
            let color: ChipProps['color'] = 'default';
            let icon: React.ReactElement | undefined = undefined;
            if (params.value === Role.ADMIN) { color = 'warning'; icon = <AdminPanelSettingsIcon sx={{fontSize: '1rem'}}/>; }
            else if (params.value === Role.SUPER_ADMIN) { color = 'secondary'; icon = <SupervisorAccountIcon sx={{fontSize: '1rem'}}/>; }
            else if (params.value === Role.USER) { color = 'info'; icon = <PersonOutlineIcon sx={{fontSize: '1rem'}}/>;}
            return <Chip label={params.value} color={color} size="small" icon={icon} variant="outlined" sx={{minWidth: 90}}/>;
        }
    },
    {
        field: 'status', headerName: 'وضعیت', width: 150, align: 'center', headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<any, UserRow>) => {
            const isActivated = params.row.isActivated;
            const isBlocked = params.row.isBlocked;
            if (isBlocked) {
                return <Chip label="مسدود" color="error" size="small" icon={<BlockIcon sx={{fontSize: '1rem'}}/>} variant="filled" />;
            } else if (isActivated) {
                 return <Chip label="فعال" color="success" size="small" icon={<VerifiedUserIcon sx={{fontSize: '1rem'}}/>} variant="outlined" />;
            } else {
                 return <Chip label="غیرفعال" color="warning" size="small" icon={<NoAccountsIcon sx={{fontSize: '1rem'}}/>} variant="outlined" />;
            }
        }
    },
    {
        field: 'createdAt', headerName: 'تاریخ عضویت', width: 150, type: 'dateTime', align: 'center', headerAlign: 'center',
        valueGetter: (value) => value ? new Date(value) : null,
        renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString('fa-IR') : '-'
    },
    {
      field: 'actions', type: 'actions', headerName: 'عملیات', width: 150, align: 'center', headerAlign: 'center',
      getActions: ({ id, row }) => {
        const targetUserId = String(id);
        const targetUserRole = row.role;
        const targetUserBlockedStatus = row.isBlocked ?? false;
        const loggedInUserRole = currentUser?.role;
        const loggedInUserId = currentUser?.id;

        // تعیین دسترسی‌ها
        let canBlockUnblock = false;
        let canDelete = false;
        let canChangeRole = false;

        if (loggedInUserRole === Role.SUPER_ADMIN && targetUserId !== loggedInUserId) {
            // سوپر ادمین همه کار می‌تواند بکند بجز روی خودش
            canBlockUnblock = true;
            canDelete = true;
            canChangeRole = true;
        } else if (loggedInUserRole === Role.ADMIN && targetUserRole === Role.USER) {
            // ادمین فقط کاربر عادی را می‌تواند مسدود/حذف کند
            canBlockUnblock = true;
            canDelete = true;
            canChangeRole = false; // ادمین نمی‌تواند نقش عوض کند
        }

        const actions = [];

        // دکمه مسدود/رفع مسدودیت
        actions.push(
            <GridActionsCellItem
                key={`block-${targetUserId}`}
                icon={
                  <Tooltip title={targetUserBlockedStatus ? "رفع مسدودیت" : "مسدود کردن"}>
                     {targetUserBlockedStatus
                         ? <CheckCircleOutlineIcon color="success" />
                         : <BlockIcon color="warning" />
                     }
                  </Tooltip>
                }
                label={targetUserBlockedStatus ? "Unblock" : "Block"}
                onClick={() => onBlockToggle(targetUserId, targetUserBlockedStatus)}
                disabled={!canBlockUnblock || isLoading} // isLoading از state اصلی می‌آید
                color="inherit"
            />
        );

         // دکمه تغییر نقش (فقط برای سوپر ادمین و روی دیگران)
         if (onChangeRole) {
             actions.push(
                 <GridActionsCellItem
                    key={`role-${targetUserId}`}
                    icon={<Tooltip title="تغییر نقش"><EditIcon /></Tooltip>}
                    label="Change Role"
                    onClick={() => onChangeRole(targetUserId, targetUserRole)}
                    disabled={!canChangeRole || isLoading}
                    color="inherit"
                 />
             );
         }

         // دکمه حذف
         actions.push(
             <GridActionsCellItem
                key={`delete-${targetUserId}`}
                icon={<Tooltip title="حذف کاربر"><DeleteIcon /></Tooltip>}
                label="Delete"
                onClick={() => onDelete(targetUserId)}
                disabled={!canDelete || isLoading}
                color="error"
             />
         );

        return actions;
      },
    },
  ];

  return (
    <Box sx={{ height: 650, width: '100%' }}>
      <DataGrid
        rows={users}
        columns={columns}
        loading={isLoading}
        rowCount={rowCount}
        pageSizeOptions={[10, 25, 50]}
        paginationModel={paginationModel}
        paginationMode="server"
        onPaginationModelChange={onPaginationModelChange}
        // sortingMode="server" // TODO
        // filterMode="server" // TODO
        sx={{ /* ... استایل‌های تم تیره ... */ }}
      />
    </Box>
  );
}

// لازم است ChipProps از @mui/material ایمپورت شود اگر از آن استفاده می‌کنید
// import { ChipProps } from '@mui/material';