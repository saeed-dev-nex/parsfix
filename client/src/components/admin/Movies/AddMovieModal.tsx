'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  CircularProgress,
  Box,
  Avatar,
  Typography,
  ListItem,
  ListItemAvatar,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { apiGet } from '@/lib/apiHelper';
import { createMovie, clearMovieError } from '@/store/slices/movieSlice';
import { MovieStatus } from '@/types';
import { AuthError } from '@/store/slices/authSlice';

interface TmdbSearchResult {
  id: number;
  title?: string;
  original_title?: string;
  release_date?: string;
  poster_path?: string;
}

interface AddMovieModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMovieModal({
  open,
  onClose,
  onSuccess,
}: AddMovieModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector((state: RootState) => state.movies.isLoading);
  const error = useSelector((state: RootState) => state.movies.error);

  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<readonly TmdbSearchResult[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<TmdbSearchResult | null>(
    null
  );
  const [status, setStatus] = useState<string>(MovieStatus.PENDING);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    return (query: string) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(async () => {
        if (query.length < 3) {
          setOptions([]);
          setIsSearching(false);
          return;
        }
        setIsSearching(true);
        setSearchError(null);
        try {
          const response = await apiGet('/movies/tmdb/search', {
            params: { query },
          });
          if (response?.status === 'success' && response?.data?.results) {
            setOptions(response.data.results);
          } else {
            setOptions([]);
            setSearchError(response?.message || 'Error searching TMDB');
          }
        } catch (err: any) {
          setOptions([]);
          setSearchError(err.message || 'Network error while searching TMDB');
        } finally {
          setIsSearching(false);
        }
      }, 500);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setOptions([]);
      setSelectedMovie(null);
      setStatus(MovieStatus.PENDING);
      setSearchError(null);
      dispatch(clearMovieError());
    }
  }, [open, dispatch]);

  const handleInputChange = (
    event: React.SyntheticEvent,
    newInputValue: string
  ) => {
    setSearchTerm(newInputValue);
    debouncedSearch(newInputValue);
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setStatus(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedMovie) {
      alert('لطفا ابتدا یک فیلم را از نتایج جستجو انتخاب کنید.');
      return;
    }
    // پاک کردن خطای Redux قبلی
    dispatch(clearMovieError());
    console.log('AddMovieModal: Submitting with:', {
      tmdbId: selectedMovie.id,
      status,
    }); // لاگ ۱

    try {
      // Dispatch thunk
      const resultAction = await dispatch(
        createMovie({
          tmdbId: selectedMovie.id,
          status: status as MovieStatus,
        })
      );

      console.log('AddMovieModal: Dispatch finished. Action:', resultAction); // لاگ ۲

      // بررسی دقیق نتیجه Action
      if (createMovie.fulfilled.match(resultAction)) {
        console.log(
          'AddMovieModal: createMovie fulfilled. Calling onSuccess...'
        ); // لاگ ۳
        onSuccess(); // <-- اجرای توابع بستن و رفرش در Parent
        console.log('AddMovieModal: onSuccess finished.'); // لاگ ۴
        // onClose(); // <-- می‌توانید onClose را هم مستقیما اینجا صدا بزنید یا فقط به onSuccess اکتفا کنید
      } else {
        console.log(
          'AddMovieModal: createMovie did not fulfill. Payload:',
          resultAction.payload
        ); // لاگ ۵
        // خطا توسط Redux مدیریت و در Alert نمایش داده می‌شود
        // نیازی به ست کردن Snackbar جداگانه در اینجا نیست مگر اینکه بخواهید
      }
    } catch (err) {
      // این catch معمولا خطاهای غیرمنتظره در خود dispatch را می‌گیرد
      console.error('AddMovieModal: Unexpected error during submit:', err);
      // می‌توانید یک خطای عمومی‌تر نمایش دهید
    }
  };

  const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: TmdbSearchResult
  ) => {
    const imageUrl = option.poster_path
      ? `https://image.tmdb.org/t/p/w92${option.poster_path}`
      : '/placeholder.png';
    const releaseYear = option.release_date
      ? `(${option.release_date.substring(0, 4)})`
      : '';
    return (
      <ListItem
        {...props}
        key={option.id}
      >
        success
        <ListItemAvatar>
          <Avatar
            src={imageUrl}
            alt={option.title}
            sx={{ width: 40, height: 60, marginRight: 1, borderRadius: 1 }}
          />
        </ListItemAvatar>
        <ListItemText
          primary={`${option.title} ${releaseYear}`}
          secondary={option.original_title}
        />
      </ListItem>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='sm'
      sx={{
        '& .MuiDialog-paper': {
          background:
            'linear-gradient(135deg, rgba(16, 16, 16, 0.95), rgba(32, 32, 32, 0.95))',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
          transform: open
            ? 'translateY(0) scale(1)'
            : 'translateY(20px) scale(0.98)',
          opacity: open ? 1 : 0,
        },
      }}
      TransitionProps={{
        timeout: { enter: 400, exit: 300 },
        easing: {
          enter: 'cubic-bezier(0.21, 1.11, 0.81, 1.01)',
          exit: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 'bold',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '24px 24px 16px',
          fontSize: '1.35rem',
          background:
            'linear-gradient(to right, rgba(229, 9, 20, 0.2), transparent)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '60px',
            height: '3px',
            background: 'linear-gradient(to right, #e50914, transparent)',
            borderRadius: '3px',
          },
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        افزودن فیلم جدید از TMDB
      </DialogTitle>
      <DialogContent sx={{ pt: '24px !important', px: 3 }}>
        {error && (
          <Alert
            severity='error'
            sx={{ mb: 2 }}
            onClose={() => dispatch(clearMovieError())}
          >
            {error.message || 'Error creating movie'}
          </Alert>
        )}
        <form
          onSubmit={handleSubmit}
          id='add-movie-form'
        >
          <Autocomplete
            fullWidth
            sx={{ mb: 3 }}
            options={options}
            loading={isSearching}
            value={selectedMovie}
            onChange={(event, newValue) => {
              setSelectedMovie(newValue);
            }}
            onInputChange={handleInputChange}
            getOptionLabel={(option) =>
              option?.title || option?.original_title || ''
            }
            renderOption={renderOption}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterOptions={(x) => x}
            noOptionsText={
              searchTerm.length < 3
                ? 'حداقل 3 کاراکتر وارد کنید'
                : 'نتیجه ای یافت نشد'
            }
            loadingText='Searching...'
            renderInput={(params) => (
              <TextField
                {...params}
                label='جستجوی فیلم با عنوان ... '
                variant='outlined'
                error={!!searchError}
                helperText={searchError}
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isSearching ? (
                          <CircularProgress
                            color='inherit'
                            size={20}
                          />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
          />

          {selectedMovie && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                background:
                  'linear-gradient(135deg, rgba(30, 30, 30, 0.8), rgba(20, 20, 20, 0.9))',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 6px 24px rgba(229, 9, 20, 0.2)',
                  borderColor: 'rgba(229, 9, 20, 0.3)',
                },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: `url(${
                    selectedMovie.poster_path
                      ? `https://image.tmdb.org/t/p/w92${selectedMovie.poster_path}`
                      : '/placeholder.png'
                  })`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.1,
                  filter: 'blur(8px)',
                  zIndex: 0,
                },
              }}
            >
              <Avatar
                src={
                  selectedMovie.poster_path
                    ? `https://image.tmdb.org/t/p/w92${selectedMovie.poster_path}`
                    : undefined
                }
                sx={{
                  width: 60,
                  height: 90,
                  borderRadius: 1,
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  zIndex: 1,
                }}
                variant='rounded'
              />
              <Box sx={{ zIndex: 1 }}>
                <Typography
                  variant='h6'
                  fontWeight='bold'
                  sx={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    color: '#fff',
                  }}
                >
                  {selectedMovie.title}
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mt: 0.5,
                  }}
                >
                  {selectedMovie.release_date?.substring(0, 4)}
                </Typography>
                <Typography
                  variant='caption'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    display: 'inline-block',
                    mt: 0.5,
                    background: 'rgba(229, 9, 20, 0.2)',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  TMDB ID: {selectedMovie.id}
                </Typography>
              </Box>
            </Box>
          )}

          <FormControl
            fullWidth
            variant='outlined'
            sx={{ mb: 3 }}
            disabled={isLoading || !selectedMovie}
          >
            <InputLabel id='status-label'>Publication Status</InputLabel>
            <Select
              labelId='status-label'
              name='status'
              value={status}
              onChange={handleStatusChange}
              label='وضعیت انتشار'
            >
              <MenuItem value={MovieStatus.PENDING}>در انتظار انتشار</MenuItem>
              <MenuItem value={MovieStatus.PUBLISHED}>منتظر شده</MenuItem>
              <MenuItem value={MovieStatus.ARCHIVED}>آرشیو شده</MenuItem>
            </Select>
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions
        sx={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          p: '20px 24px',
          background: 'rgba(20, 20, 20, 0.5)',
          backdropFilter: 'blur(10px)',
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '8px',
            px: 3,
            py: 1,
            transition: 'all 0.2s ease',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.08)',
              transform: 'translateY(-2px)',
            },
          }}
          disabled={isLoading}
        >
          انصراف
        </Button>
        <Button
          type='submit'
          form='add-movie-form'
          variant='contained'
          sx={{
            background: 'linear-gradient(45deg, #e50914, #ff3d47)',
            color: 'white',
            borderRadius: '8px',
            px: 3,
            py: 1,
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(229, 9, 20, 0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #b30710, #e50914)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(229, 9, 20, 0.4)',
            },
            '&:disabled': {
              background: 'rgba(229, 9, 20, 0.5)',
              color: 'rgba(255, 255, 255, 0.5)',
            },
          }}
          disabled={isLoading || !selectedMovie}
        >
          {isLoading ? (
            <CircularProgress
              size={24}
              sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
            />
          ) : (
            'افزودن فیلم'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
