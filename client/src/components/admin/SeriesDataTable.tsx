'use client';

import React from 'react';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridActionsCellItem,
  GridRenderCellParams,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  Box,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Typography,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TvIcon from '@mui/icons-material/Tv'; // آیکن سریال
import { SeriesAdminList, User, Role, SeriesStatus } from '@/types'; // تایپ‌های لازم
import { ChipProps } from '@mui/material';

interface SeriesDataTableProps {
  seriesList: SeriesAdminList[];
  isLoading: boolean;
  rowCount: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView?: (id: string) => void;
  currentUserRole?: Role;
  currentUserId?: string;
}

// تایپ ردیف
interface SeriesRow extends SeriesAdminList {}

export default function SeriesDataTable({
  seriesList,
  isLoading,
  rowCount,
  paginationModel,
  onPaginationModelChange,
  onEdit,
  onDelete,
  onView,
  currentUserRole,
  currentUserId,
}: SeriesDataTableProps) {
  const theme = useTheme();

  const columns: GridColDef<SeriesRow>[] = [
    {
      field: 'posterPath',
      headerName: 'پوستر',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Avatar
          src={params.value || undefined}
          sx={{
            width: 45,
            height: 65,
            borderRadius: 1,
            bgcolor: 'grey.800',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          variant='rounded'
          alt='Poster'
        >
          <TvIcon />
        </Avatar>
      ),
    },
    {
      field: 'title',
      headerName: 'عنوان',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Tooltip title={params.row.title || ''}>
          <Typography
            noWrap
            variant='body2'
            sx={{
              fontWeight: 500,
              color: 'text.primary',
            }}
          >
            {params.row.title}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'tmdbId',
      headerName: 'TMDB ID',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography
          variant='body2'
          sx={{
            color: 'text.secondary',
            fontFamily: 'monospace',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'وضعیت',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<any, SeriesRow>) => {
        const status = params.row.status;
        let color: ChipProps['color'] = 'default';
        let label = String(status || 'نامشخص');
        if (status === SeriesStatus.PUBLISHED) {
          color = 'success';
          label = 'منتشر شده';
        } else if (status === SeriesStatus.PENDING) {
          color = 'warning';
          label = 'در انتظار';
        } else if (status === SeriesStatus.ENDED) {
          color = 'info';
          label = 'پایان یافته';
        } else if (status === SeriesStatus.CANCELED) {
          color = 'error';
          label = 'لغو شده';
        } else if (status === SeriesStatus.ARCHIVED) {
          color = 'secondary';
          label = 'بایگانی';
        }
        return (
          <Chip
            label={label}
            color={color}
            size='small'
            variant='outlined'
            sx={{
              minWidth: 95,
              fontWeight: 500,
              '& .MuiChip-label': {
                px: 1,
              },
            }}
          />
        );
      },
    },
    {
      field: 'numberOfSeasons',
      headerName: 'فصل',
      type: 'number',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (v) => v ?? '-',
      renderCell: (params) => (
        <Typography
          variant='body2'
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          {params.value ?? '-'}
        </Typography>
      ),
    },
    {
      field: 'numberOfEpisodes',
      headerName: 'قسمت',
      type: 'number',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (v) => v ?? '-',
      renderCell: (params) => (
        <Typography
          variant='body2'
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          {params.value ?? '-'}
        </Typography>
      ),
    },
    {
      field: 'firstAirDate',
      headerName: 'شروع پخش',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      type: 'date',
      valueGetter: (v) => (v ? new Date(v) : null),
      renderCell: (p) => (
        <Typography
          variant='body2'
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          {p.value ? new Date(p.value).toLocaleDateString('fa-IR') : '-'}
        </Typography>
      ),
    },
    {
      field: 'addedBy',
      headerName: 'اضافه شده توسط',
      flex: 0.5,
      minWidth: 150,
      valueGetter: (v, row) => row.addedBy?.name || row.addedBy?.email || '-',
      renderCell: (params) => (
        <Tooltip title={params.row.addedBy?.email || ''}>
          <Typography
            variant='body2'
            noWrap
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            {params.row.addedBy?.name || '-'}
          </Typography>
        </Tooltip>
      ),
      sortable: false,
    },
    {
      field: 'createdAt',
      headerName: 'تاریخ ایجاد',
      width: 130,
      type: 'dateTime',
      align: 'center',
      headerAlign: 'center',
      valueGetter: (v) => (v ? new Date(v) : null),
      renderCell: (p) => (
        <Typography
          variant='body2'
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          {p.value
            ? new Date(p.value).toLocaleDateString('fa-IR', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '-'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'عملیات',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      getActions: ({ id, row }) => {
        const recordId = String(id);
        const canEditDelete =
          currentUserRole === Role.SUPER_ADMIN ||
          (currentUserRole === Role.ADMIN && row.addedBy?.id === currentUserId);
        let actions = [];

        if (onView) {
          actions.push(
            <GridActionsCellItem
              key={`view-${recordId}`}
              icon={
                <Tooltip title='مشاهده'>
                  <VisibilityIcon fontSize='small' />
                </Tooltip>
              }
              label='View'
              onClick={() => onView(recordId)}
              color='primary'
              disabled={isLoading}
            />
          );
        }

        actions.push(
          <GridActionsCellItem
            key={`edit-${recordId}`}
            icon={
              <Tooltip title='ویرایش'>
                <EditIcon fontSize='small' />
              </Tooltip>
            }
            label='ویرایش'
            onClick={() => onEdit(recordId)}
            color='primary'
            disabled={!canEditDelete || isLoading}
          />,
          <GridActionsCellItem
            key={`delete-${recordId}`}
            icon={
              <Tooltip title='حذف'>
                <DeleteIcon fontSize='small' />
              </Tooltip>
            }
            label='Delete'
            onClick={() => onDelete(recordId)}
            color='primary'
            disabled={!canEditDelete || isLoading}
          />
        );
        return actions;
      },
    },
  ];

  return (
    <Box sx={{ height: 650, width: '100%' }}>
      <DataGrid
        rows={seriesList}
        columns={columns}
        loading={isLoading}
        rowCount={rowCount}
        pageSizeOptions={[10, 25, 50]}
        paginationModel={paginationModel}
        paginationMode='server'
        onPaginationModelChange={onPaginationModelChange}
        slots={{
          toolbar: GridToolbar,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderColor: 'divider',
          },
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: 'background.default',
            borderBottom: '2px solid',
            borderColor: 'divider',
          },
          '& .MuiDataGrid-columnHeader': {
            py: 1.5,
          },
          '& .MuiDataGrid-cell': {
            py: 1.5,
          },
          '& .MuiDataGrid-row:hover': {
            bgcolor: 'action.hover',
          },
          '& .MuiDataGrid-row.Mui-selected': {
            bgcolor: 'action.selected',
            '&:hover': {
              bgcolor: 'action.selected',
            },
          },
          '& .MuiDataGrid-toolbarContainer': {
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid',
            borderColor: 'divider',
          },
        }}
      />
    </Box>
  );
}
