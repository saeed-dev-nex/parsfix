import { Movie, MovieAdminList, Role } from '@/types';
import { Delete, Edit, Image, Visibility } from '@mui/icons-material';
import { Avatar, Box, Chip, Tooltip, Typography } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridActionsCellItem,
  GridRenderCellParams,
} from '@mui/x-data-grid';

interface MovieDataTableProps {
  movies: MovieAdminList[];
  isLoading: boolean;
  rowCount: number;
  paginationModel: { page: number; pageSize: number };
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  currentUserRole?: Role; // نقش کاربر لاگین کرده
  currentUserId?: string; // ID کاربر لاگین کرده
}
interface MovieRow extends Movie {
  addedBy?: { id: string; name?: string | null; email?: string | null } | null;
  _count?: { comments?: number; ratings?: number };
}
export default function MovieDataTable({
  movies,
  isLoading,
  rowCount,
  paginationModel,
  onPaginationModelChange,
  onEdit,
  onDelete,
  onView,
  currentUserRole,
  currentUserId,
}: MovieDataTableProps) {
  // Define columns for the DataGrid
  // تعریف ستون‌های جدول
  const columns: GridColDef<MovieRow>[] = [
    {
      field: 'posterPath',
      headerName: 'پوستر',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<any, MovieRow>) => (
        <Box
          sx={{
            position: 'relative',
            width: 50,
            height: 70,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              zIndex: 10,
            },
          }}
        >
          <Avatar
            src={params?.value?.toString() || ''} // URL poster from Cloudinary
            sx={{
              width: 50,
              height: 70,
              borderRadius: 1,
              bgcolor: 'grey.900',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 6px 12px rgba(229, 9, 20, 0.4)',
                borderColor: 'rgba(229, 9, 20, 0.3)',
              },
            }}
            variant='rounded'
            alt={params.row.title || 'Poster'}
          >
            <Image sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
          </Avatar>
          {params.row.title && (
            <Box
              sx={{
                position: 'absolute',
                bottom: -5,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                height: '3px',
                background:
                  'linear-gradient(to right, transparent, #e50914, transparent)',
                borderRadius: '3px',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                '.MuiDataGrid-row:hover &': {
                  opacity: 1,
                },
              }}
            />
          )}
        </Box>
      ),
    },
    // { field: 'id', headerName: 'ID', width: 150 },
    {
      field: 'title',
      headerName: 'عنوان',
      flex: 0.5, // ستون عنوان فضای بیشتری بگیرد
      width: 250,
      renderCell: (
        params: GridRenderCellParams<any, MovieRow> // تایپ اضافه شد
      ) => (
        <Tooltip title={params.row.title || ''}>
          <Typography
            noWrap
            variant='body2'
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
    },
    {
      field: 'status',
      headerName: 'وضعیت',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<any, MovieRow>) => {
        const status = params.row.status; // وضعیت از نوع MovieStatus یا string?
        let color: 'success' | 'warning' | 'default' | 'error' = 'default';
        let label = String(status || 'نامشخص');
        let bgColor = 'rgba(255, 255, 255, 0.1)';
        let textColor = '#fff';

        if (status === 'PUBLISHED') {
          color = 'success';
          label = 'منتشر شده';
          bgColor = 'rgba(46, 125, 50, 0.15)';
          textColor = '#81c784';
        } else if (status === 'PENDING') {
          color = 'warning';
          label = 'در انتظار';
          bgColor = 'rgba(237, 108, 2, 0.15)';
          textColor = '#ffb74d';
        } else if (status === 'ARCHIVED') {
          color = 'error';
          label = 'بایگانی';
          bgColor = 'rgba(211, 47, 47, 0.15)';
          textColor = '#e57373';
        } // فرض حالت بایگانی
        return (
          <Chip
            label={label}
            color={color}
            size='small'
            sx={{
              fontWeight: 'medium',
              background: bgColor,
              color: textColor,
              border: `1px solid ${textColor}`,
              boxShadow: `0 0 8px ${bgColor}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 3px 10px ${bgColor}`,
              },
            }}
          />
        );
      },
    },
    {
      field: 'releaseDate',
      headerName: 'تاریخ انتشار',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      type: 'date',
      valueGetter: (value) => (value ? new Date(value) : null),
      renderCell: (params) =>
        params.value ? new Date(params.value).toLocaleDateString('fa-IR') : '-',
    },
    {
      field: 'imdbRating',
      headerName: 'IMDb',
      type: 'number',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (value: number | null | undefined) =>
        value ? value.toFixed(1) : '-',
    },
    {
      field: 'addedBy',
      headerName: 'اضافه شده توسط',

      minWidth: 250,
      valueGetter: (value, row) =>
        row.addedBy?.name || row.addedBy?.email || '-',
      renderCell: (params: GridRenderCellParams<any, MovieRow>) => (
        <Tooltip title={params.row.addedBy?.email || ''}>
          <Typography
            variant='body2'
            noWrap
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
      valueGetter: (value) => (value ? new Date(value) : null),
      renderCell: (params) =>
        params.value
          ? new Date(params.value).toLocaleDateString('fa-IR', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '-',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'عملیات',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      cellClassName: 'actions',
      getActions: ({ id, row }) => {
        // آبجکت row را هم می‌گیریم
        const recordId = String(id);
        // --- بررسی دسترسی برای فعال/غیرفعال کردن دکمه‌ها ---
        const canEditDelete =
          currentUserRole === Role.SUPER_ADMIN ||
          (currentUserRole === Role.ADMIN && row.addedBy?.id === currentUserId);
        // ----------------------------------------------------
        let actions = [];

        if (onView) {
          actions.push(
            <GridActionsCellItem
              key={`view-${recordId}`}
              icon={
                <Tooltip
                  title='مشاهده'
                  arrow
                  placement='top'
                  sx={{
                    '& .MuiTooltip-arrow': {
                      color: 'rgba(25, 118, 210, 0.9)',
                    },
                    '& .MuiTooltip-tooltip': {
                      backgroundColor: 'rgba(25, 118, 210, 0.9)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                      fontWeight: 'medium',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      p: 0.5,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(25, 118, 210, 0.1)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Visibility sx={{ color: 'primary.main' }} />
                  </Box>
                </Tooltip>
              }
              label='View'
              onClick={() => onView(recordId)}
              color='primary'
              sx={{
                '&.MuiButtonBase-root': {
                  padding: 0,
                },
              }}
            />
          );
        }

        actions.push(
          <GridActionsCellItem
            key={`edit-${recordId}`}
            icon={
              <Tooltip
                title='ویرایش'
                arrow
                placement='top'
                sx={{
                  '& .MuiTooltip-arrow': {
                    color: 'rgba(25, 118, 210, 0.9)',
                  },
                  '& .MuiTooltip-tooltip': {
                    backgroundColor: 'rgba(25, 118, 210, 0.9)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    fontWeight: 'medium',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    p: 0.5,
                    transition: 'all 0.2s ease',
                    opacity: canEditDelete ? 1 : 0.5,
                    '&:hover': canEditDelete
                      ? {
                          background: 'rgba(25, 118, 210, 0.1)',
                          transform: 'translateY(-2px)',
                        }
                      : {},
                  }}
                >
                  <Edit
                    sx={{
                      color: canEditDelete ? 'primary.main' : 'text.disabled',
                    }}
                  />
                </Box>
              </Tooltip>
            }
            label='Edit'
            onClick={() => onEdit(recordId)}
            color='primary'
            disabled={!canEditDelete}
            sx={{
              '&.MuiButtonBase-root': {
                padding: 0,
              },
            }}
          />,
          <GridActionsCellItem
            key={`delete-${recordId}`}
            icon={
              <Tooltip
                title='حذف'
                arrow
                placement='top'
                sx={{
                  '& .MuiTooltip-arrow': {
                    color: 'rgba(211, 47, 47, 0.9)',
                  },
                  '& .MuiTooltip-tooltip': {
                    backgroundColor: 'rgba(211, 47, 47, 0.9)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    fontWeight: 'medium',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    p: 0.5,
                    transition: 'all 0.2s ease',
                    opacity: canEditDelete ? 1 : 0.5,
                    '&:hover': canEditDelete
                      ? {
                          background: 'rgba(211, 47, 47, 0.1)',
                          transform: 'translateY(-2px)',
                        }
                      : {},
                  }}
                >
                  <Delete
                    sx={{
                      color: canEditDelete ? 'error.main' : 'text.disabled',
                    }}
                  />
                </Box>
              </Tooltip>
            }
            label='Delete'
            onClick={() => onDelete(recordId)}
            color='inherit'
            disabled={!canEditDelete}
            sx={{
              '&.MuiButtonBase-root': {
                padding: 0,
              },
            }}
          />
        );

        return actions;
      },
    },
  ];
  // --- لاگ کردن مقدار rowCount ---
  console.log(
    'Rendering MovieDataTable with rowCount:',
    rowCount,
    'isLoading:',
    isLoading
  );
  // ------------------------------
  return (
    <Box
      sx={{
        height: 650,
        width: '100%',
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
        background:
          'linear-gradient(180deg, rgba(25, 25, 25, 0.9), rgba(18, 18, 18, 0.95))',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: 'linear-gradient(90deg, #e50914, transparent)',
          zIndex: 2,
        },
      }}
    >
      <DataGrid
        rows={movies}
        columns={columns}
        loading={isLoading}
        rowCount={rowCount}
        pageSizeOptions={[5, 10, 20]}
        paginationModel={paginationModel}
        paginationMode='server'
        onPaginationModelChange={onPaginationModelChange}
        sx={{
          border: 'none',
          padding: '0 14px',
          borderRadius: '16px',
          '& .MuiDataGrid-main': {
            borderRadius: '16px',
            overflow: 'hidden',
          },
          '& .MuiDataGrid-row': {
            transition: 'background-color 0.2s ease, transform 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05) !important',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
          },
          '& .MuiDataGrid-row:nth-of-type(odd)': {
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '12px 16px',
            fontSize: '0.95rem',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '2px solid rgba(229, 9, 20, 0.3)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
              fontSize: '0.95rem',
              color: 'rgba(255, 255, 255, 0.95)',
            },
          },
          '& .MuiDataGrid-virtualScroller': {
            background: 'transparent',
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
          },
          '& .MuiTablePagination-root': {
            color: 'rgba(255, 255, 255, 0.9)',
          },
          '& .MuiIconButton-root': {
            color: 'rgba(255, 255, 255, 0.8)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(229, 9, 20, 0.1)',
              color: '#fff',
            },
          },
          '& .MuiDataGrid-overlay': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
          },
          '& .MuiCircularProgress-root': {
            color: '#e50914',
          },
          '& .MuiDataGrid-toolbarContainer': {
            padding: '8px 16px',
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
          },
          '& .MuiDataGrid-selectedRowCount': {
            color: 'rgba(255, 255, 255, 0.7)',
          },
          '& .MuiCheckbox-root': {
            color: 'rgba(255, 255, 255, 0.5)',
            '&.Mui-checked': {
              color: '#e50914',
            },
          },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
          '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within':
            {
              outline: 'none',
            },
        }}
        componentsProps={{
          pagination: {
            sx: {
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows':
                {
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.9rem',
                },
              '& .MuiTablePagination-select': {
                color: 'rgba(255, 255, 255, 0.9)',
              },
              '& .MuiTablePagination-actions': {
                '& .MuiIconButton-root.Mui-disabled': {
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              },
            },
          },
        }}
        // sortingMode="server" // TODO: Add server-side sorting later
        // filterMode="server" // TODO: Add server-side filtering later
        // checkboxSelection // فعال کردن انتخاب چندتایی (اختیاری)
        // disableRowSelectionOnClick
      />
    </Box>
  );
}
