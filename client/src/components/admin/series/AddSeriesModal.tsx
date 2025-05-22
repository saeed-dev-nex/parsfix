import React, { useEffect, useMemo, useState } from 'react';
import {
  clearSeriesError,
  clearSeriesProcessingMessage,
  createSeries,
  selectSeriesError,
  selectSeriesIsLoading,
  selectSeriesIsProcessing,
  selectSeriesProcessingMessage,
} from '@/store/slices/seriesSlice';
import { AppDispatch } from '@/store/store';
import {
  AddSeriesModalProps,
  SeriesStatus,
  TmdbSeriesSearchResult,
} from '@/types';
import { useDispatch, useSelector } from 'react-redux';
import { apiGet } from '@/lib/apiHelper';
import { clear } from 'console';
import { useDebouncedCallback } from 'use-debounce';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  LinearProgress,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';

export default function AddSeriesModal({
  open,
  onClose,
  onSuccess,
}: AddSeriesModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector(selectSeriesIsLoading);
  const isProcessing = useSelector(selectSeriesIsProcessing);
  const processingMessage = useSelector(selectSeriesProcessingMessage);
  const createError = useSelector(selectSeriesError);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<readonly TmdbSeriesSearchResult[]>([]);
  const [selectedSeries, setSelectedSeries] =
    useState<TmdbSeriesSearchResult | null>(null);
  const [status, setStatus] = useState<string>(SeriesStatus.PENDING);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedCallback(
    async (query: string) => {
      if (query.length < 3) {
        setOptions([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      setSearchError(null);
      try {
        const response = await apiGet('/series/tmdb/search', {
          params: { query },
        }); // <-- API جستجوی سریال
        if (response?.status === 'success' && response?.data?.results) {
          setOptions(response.data.results);
        } else {
          setOptions([]);
          setSearchError(response?.message || 'خطا در جستجوی سریال');
        }
      } catch (err: any) {
        setOptions([]);
        setSearchError(err.message || 'خطای شبکه هنگام جستجو');
      } finally {
        setIsSearching(false);
      }
    },
    500 // 500ms delay
  );
  // Reset States When Close Modal
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setOptions([]);
      setSelectedSeries(null);
      setStatus(SeriesStatus.PENDING);
      setIsSearching(false);
      setSearchError(null);
      dispatch(clearSeriesError());
      dispatch(clearSeriesProcessingMessage());
    }
  }, [open, dispatch]);

  const handleInputChange = (
    event: React.SyntheticEvent,
    newInputValue: string
  ) => {
    setSearchTerm(newInputValue);
    debouncedSearch(newInputValue); // Call the debounced function with the new input value
  };
  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setStatus(event.target.value as SeriesStatus);
  };

  //   Handle Submit for create series
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSeries) {
      alert('لطفا یک سریال را انتخاب کنید!');
      return;
    }
    try {
      await dispatch(
        createSeries({
          tmdbId: selectedSeries.id,
          status: status as SeriesStatus,
        })
      ).unwrap();
      console.log('Series created successfully! (from modal)');
      onSuccess();
      onClose();
      dispatch(clearSeriesError());
      dispatch(clearSeriesProcessingMessage());
    } catch (error: any) {
      console.error('Error creating series:', error);
      alert(
        error?.message ||
          'خطا در ایجاد سریال. لطفا دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.'
      );
    }
  };
  const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: TmdbSeriesSearchResult
  ) => {
    const imageUrl = option.poster_path
      ? `https://image.tmdb.org/t/p/w92${option.poster_path}`
      : undefined;
    const releaseYear = option.first_air_date
      ? `(${option.first_air_date.substring(0, 4)})`
      : '';
    return (
      <ListItem
        {...props}
        key={option.id}
      >
        <ListItemAvatar>
          <Avatar
            src={imageUrl}
            sx={{ width: 40, height: 60, mr: 1, borderRadius: 1 }}
            variant='rounded'
          />
        </ListItemAvatar>
        <ListItemText
          primary={`${option.name} ${releaseYear}`}
          secondary={option.original_name}
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
    >
      <DialogTitle
        sx={{ fontWeight: 'bold', borderBottom: '1px solid divider' }}
      >
        افزودن سریال جدید از TMDB
      </DialogTitle>
      <DialogContent sx={{ pt: '20px !important' }}>
        {/* نمایش خطای ایجاد سریال */}
        {createError && (
          <Alert
            severity='error'
            sx={{ mb: 2 }}
            onClose={() => dispatch(clearSeriesError())}
          >
            {createError.message || 'خطا در ایجاد سریال'}
          </Alert>
        )}
        {isProcessing && (
          <Box sx={{ my: 3, textAlign: 'center' }}>
            <CircularProgress
              size={40}
              sx={{ mb: 2 }}
            />
            <Typography
              variant='body1'
              color='text.secondary'
            >
              {processingMessage || 'در حال پردازش...'}
            </Typography>
            {/* می‌توانید از LinearProgress هم استفاده کنید */}
            <LinearProgress
              sx={{ mt: 1 }}
              color='primary'
            />
          </Box>
        )}

        {!isProcessing && (
          <form
            onSubmit={handleSubmit}
            id='add-series-form'
          >
            {/* Autocomplete جستجو */}
            <Autocomplete
              fullWidth
              sx={{ mb: 3 }}
              options={options}
              loading={isSearching}
              value={selectedSeries}
              onChange={(event, newValue) => setSelectedSeries(newValue)}
              onInputChange={handleInputChange}
              getOptionLabel={(option) =>
                option.name || option.original_name || ''
              }
              renderOption={renderOption}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              filterOptions={(x) => x}
              noOptionsText={
                searchTerm.length < 3 ? 'حداقل 3 کاراکتر...' : 'یافت نشد'
              }
              loadingText='در حال جستجو...'
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='جستجوی نام سریال در TMDB'
                  variant='outlined'
                  error={!!searchError}
                  helperText={searchError}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isSearching ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            {/* نمایش سریال انتخاب شده */}
            {selectedSeries && (
              <Box
                sx={{
                  mb: 3,
                  p: 1.5,
                  border: '1px solid grey',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Avatar
                  src={
                    selectedSeries.poster_path
                      ? `https://image.tmdb.org/t/p/w92${selectedSeries.poster_path}`
                      : undefined
                  }
                  sx={{ width: 50, height: 75, borderRadius: 1 }}
                  variant='rounded'
                />
                <Box>
                  <Typography
                    variant='body1'
                    fontWeight='bold'
                  >
                    {selectedSeries.name}
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                  >
                    {selectedSeries.first_air_date?.substring(0, 4)}
                  </Typography>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                  >
                    TMDB ID: {selectedSeries.id}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* انتخاب وضعیت */}
            <FormControl
              fullWidth
              variant='outlined'
              sx={{ mb: 3 }}
              disabled={isProcessing || !selectedSeries}
            >
              <InputLabel id='series-status-label'>وضعیت انتشار</InputLabel>
              <Select
                labelId='series-status-label'
                name='status'
                value={status}
                onChange={handleStatusChange}
                label='وضعیت انتشار'
              >
                <MenuItem value={SeriesStatus.PENDING}>در انتظار</MenuItem>
                <MenuItem value={SeriesStatus.PUBLISHED}>منتشر شده</MenuItem>
                <MenuItem value={SeriesStatus.ENDED}>پایان یافته</MenuItem>
                <MenuItem value={SeriesStatus.CANCELED}>لغو شده</MenuItem>
                <MenuItem value={SeriesStatus.ARCHIVED}>بایگانی</MenuItem>
              </Select>
            </FormControl>
          </form>
        )}
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid divider', p: '16px 24px' }}>
        <Button
          onClick={onClose}
          color='inherit'
          disabled={isProcessing}
        >
          انصراف
        </Button>
        <Button
          type='submit'
          form='add-series-form'
          variant='contained'
          color='primary'
          disabled={isProcessing || !selectedSeries}
        >
          {isProcessing ? <CircularProgress size={24} /> : 'افزودن سریال'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
