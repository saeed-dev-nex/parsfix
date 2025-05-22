'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // useParams برای گرفتن ID از URL
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tooltip,
  Chip,
  Snackbar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import TvIcon from '@mui/icons-material/Tv';
import AddIcon from '@mui/icons-material/Add'; // برای افزودن قسمت جدید؟
import ImageIcon from '@mui/icons-material/Image';
import TheatersIcon from '@mui/icons-material/Theaters'; // آیکن اپیزود
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { AppDispatch, RootState } from '@/store/store';
import {
  fetchSeriesById,
  selectSelectedSeriesDetail,
  selectSeriesIsLoading,
  selectSeriesError,
  clearSeriesError,
  clearSelectedSeries,
  selectSeriesIsProcessing,
} from '@/store/slices/seriesSlice';
import { Episode, Role, Season } from '@/types';
import {
  clearSeasonError,
  clearSeasonSuccessMessage,
  selectSeasonError,
  selectSeasonIsLoadingPosterUpload,
  selectSeasonIsLoadingUpdate,
  selectSeasonSuccessMessage,
} from '@/store/slices/seasonSlice';
import EditSeasonModal from '@/components/admin/series/EditSeasonModal';
import EditSeriesModal from '@/components/admin/series/EditSeriesModal';
import EditEpisodeModal from '@/components/admin/series/EditEpisodeModal';
// TODO: Import EditSeasonModal, EditEpisodeModal later
interface EditSeasonModalProps {
  open: boolean;
  seasonData: Season | null; // داده‌های فصل فعلی
  onClose: () => void;
  onSuccess: () => void; // برای بستن مودال و نمایش پیام در والد
}

interface SeasonFormData {
  name: string;
  overview: string;
  airDate: Date | null;
}
const initialFormData: SeasonFormData = {
  name: '',
  overview: '',
  airDate: null,
};
export default function EditSeriesDetailsPage() {
  useAuthProtection({ allowedRoles: [Role.ADMIN, Role.SUPER_ADMIN] });

  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const router = useRouter(); // برای بازگشت احتمالی

  const seriesId = params.seriesId as string; // گرفتن ID از URL

  // --- خواندن state از Redux ---
  const seriesDetails = useSelector(selectSelectedSeriesDetail);
  const isProcessing = useSelector(selectSeriesIsProcessing);
  const isLoading = useSelector(selectSeriesIsLoading);
  const isLoadingUpdate = useSelector(selectSeasonIsLoadingUpdate);
  const isLoadingPosterUpload = useSelector(selectSeasonIsLoadingPosterUpload);

  const successMessage = useSelector(selectSeasonSuccessMessage);
  const seriesError = useSelector(selectSeriesError); // خطای مربوط به واکشی/آپدیت سریال
  const seasonError = useSelector(selectSeasonError);
  const seasonSuccessMessage = useSelector(selectSeasonSuccessMessage);

  const [formData, setFormData] = useState<SeasonFormData>(initialFormData);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [expandedSeason, setExpandedSeason] = useState<string | false>(false);
  const [editSeasonModalState, setEditSeasonModalState] = useState<{
    open: boolean;
    seasonData: Season | null;
  }>({ open: false, seasonData: null });
  // --- State برای مودال ویرایش فصل ---
  const [editEpisodeModalState, setEditEpisodeModalState] = useState<{
    open: boolean;
    episodeData: Episode | null;
  }>({ open: false, episodeData: null });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });
  // State برای کنترل باز/بسته بودن Accordion فصل‌ها

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedSeason(isExpanded ? panel : false);
    };

  // --- واکشی اطلاعات سریال ---
  useEffect(() => {
    if (seriesId) {
      console.log(
        `[EditSeriesPage] Fetching details for series ID: ${seriesId}`
      );
      dispatch(fetchSeriesById(seriesId));
    }
    // Cleanup
    return () => {
      dispatch(clearSelectedSeries());
      dispatch(clearSeriesError());
      dispatch(clearSeasonError()); // پاک کردن خطای فصل هم
      dispatch(clearSeasonSuccessMessage()); // پاک کردن پیام موفقیت فصل هم
    };
  }, [seriesId, dispatch]);

  // پر کردن فرم و ریست dirty flag هنگام باز شدن یا تغییر seasonData
  useEffect(() => {
    const errorToShow = seriesError || seasonError; // اولویت با خطای فصل؟ یا ترکیب کنیم؟
    if (errorToShow) {
      setSnackbar({
        open: true,
        message: errorToShow.message,
        severity: 'error',
      });
      // پاک کردن خطا پس از نمایش
      if (seriesError) dispatch(clearSeriesError());
      if (seasonError) dispatch(clearSeasonError());
    }
  }, [open, selectedSeason, dispatch]);
  useEffect(() => {
    if (seasonSuccessMessage) {
      setSnackbar({
        open: true,
        message: seasonSuccessMessage,
        severity: 'success',
      });
      dispatch(clearSeasonSuccessMessage());
    }
  }, [seasonSuccessMessage, dispatch]);

  // --- Handlers برای ویرایش فصل/قسمت (فعلا Placeholder) ---
  // --- Handlers برای ویرایش فصل ---
  const handleEditSeason = (season: Season | null | undefined) => {
    if (!season) return;
    console.log(`Edit season clicked: S${season.seasonNumber}`);
    setEditSeasonModalState({ open: true, seasonData: season });
  };
  const handleCloseEditSeasonModal = () =>
    setEditSeasonModalState({ open: false, seasonData: null });
  const handleUpdateSeasonSuccess = () => {
    console.log('Season updated successfully callback in parent.');
    handleCloseEditSeasonModal();
    // نیازی به رفرش کل صفحه نیست چون seriesSlice به آپدیت فصل گوش می‌دهد
    // اما می‌توانید پیام موفقیت در Snackbar اینجا نشان دهید یا به profileSlice بسپارید
    setSnackbar({
      open: true,
      message: 'فصل با موفقیت به‌روزرسانی شد.',
      severity: 'success',
    });
  };
  // --------------------------------

  // --- مدیریت مودال ویرایش قسمت ---
  const handleEditEpisode = (episode: Episode | null | undefined) => {
    if (!episode) return;
    console.log(
      `[EditSeriesPage] Opening edit modal for episode S${episode.seasonNumber}E${episode.episodeNumber}`
    );
    setEditEpisodeModalState({ open: true, episodeData: episode });
  };
  const handleCloseEditEpisodeModal = () =>
    setEditEpisodeModalState({ open: false, episodeData: null });
  const handleUpdateEpisodeSuccess = () => {
    console.log('[EditSeriesPage] Episode update successful callback.');
    handleCloseEditEpisodeModal();
    // رفرش کل جزئیات سریال برای نمایش تغییرات قسمت
    if (seriesId) dispatch(fetchSeriesById(seriesId));
    // نمایش پیام موفقیت از episodeSlice توسط useEffect مربوط به Snackbar
  };
  // --------------------------------

  if (isProcessing && isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (seriesError) {
    return (
      <Alert
        severity='error'
        sx={{ m: 3 }}
      >
        خطا در واکشی جزئیات سریال: {seriesError.message}
      </Alert>
    );
  }

  if (!seriesDetails) {
    // ممکن است بعد از fetch ناموفق یا در حالت اولیه اینجا بیاید
    return (
      <Alert
        severity='warning'
        sx={{ m: 3 }}
      >
        جزئیات سریال یافت نشد.
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: '1400px', margin: '0 auto', p: 3 }}>
      {/* هدر صفحه با طراحی مدرن */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
          p: 3,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TvIcon sx={{ fontSize: 40, color: 'white' }} />
          <Typography
            variant='h4'
            sx={{
              fontWeight: 'bold',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            {seriesDetails.title}
          </Typography>
        </Box>
      </Box>

      {/* کارت اطلاعات سریال با طراحی مدرن */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.1)',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
          },
        }}
      >
        <Grid
          container
          spacing={4}
        >
          <Grid size={{ xs: 12, md: 2 }}>
            <Avatar
              src={seriesDetails.posterPath || undefined}
              variant='rounded'
              sx={{
                width: '100%',
                height: 'auto',
                aspectRatio: '2/3',
                bgcolor: 'grey.800',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <TvIcon />
            </Avatar>
          </Grid>
          <Grid size={{ xs: 12, md: 9 }}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant='h5'
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #2196F3, #00BCD4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {seriesDetails.title}
              </Typography>
              <Typography
                variant='body2'
                color='text.secondary'
                paragraph
                sx={{
                  maxHeight: 100,
                  overflow: 'auto',
                  lineHeight: 1.7,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                  },
                }}
              >
                {seriesDetails.description || 'توضیحات موجود نیست.'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label={`وضعیت: ${seriesDetails.status || '-'}`}
                size='small'
                sx={{
                  background: 'rgba(33, 150, 243, 0.1)',
                  color: '#2196F3',
                  '&:hover': { background: 'rgba(33, 150, 243, 0.2)' },
                }}
              />
              <Chip
                label={`TMDB ID: ${seriesDetails.tmdbId}`}
                size='small'
                sx={{
                  background: 'rgba(76, 175, 80, 0.1)',
                  color: '#4CAF50',
                  '&:hover': { background: 'rgba(76, 175, 80, 0.2)' },
                }}
              />
              <Chip
                label={`فصل‌ها: ${seriesDetails.numberOfSeasons || '-'}`}
                size='small'
                sx={{
                  background: 'rgba(255, 152, 0, 0.1)',
                  color: '#FF9800',
                  '&:hover': { background: 'rgba(255, 152, 0, 0.2)' },
                }}
              />
              <Chip
                label={`قسمت‌ها: ${seriesDetails.numberOfEpisodes || '-'}`}
                size='small'
                sx={{
                  background: 'rgba(156, 39, 176, 0.1)',
                  color: '#9C27B0',
                  '&:hover': { background: 'rgba(156, 39, 176, 0.2)' },
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* بخش فصل‌ها و قسمت‌ها با طراحی مدرن */}
      <Typography
        variant='h5'
        sx={{
          mb: 3,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          '&::before': {
            content: '""',
            display: 'block',
            width: '4px',
            height: '24px',
            background: 'linear-gradient(45deg, #2196F3, #00BCD4)',
            borderRadius: '2px',
          },
        }}
      >
        فصل‌ها و قسمت‌ها
      </Typography>

      {seriesDetails.seasons && seriesDetails.seasons.length > 0 ? (
        seriesDetails.seasons
          .slice()
          .sort((a, b) => (a.seasonNumber ?? 0) - (b.seasonNumber ?? 0))
          .map((season) => (
            <Accordion
              key={season.id || `season-${season.seasonNumber}`}
              expanded={expandedSeason === `season-${season.seasonNumber}`}
              onChange={handleAccordionChange(`season-${season.seasonNumber}`)}
              sx={{
                mb: 2,
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px !important',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                  margin: '16px 0',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                sx={{
                  '&:hover': {
                    background: 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    gap: 2,
                  }}
                >
                  <Avatar
                    src={season.posterPath || undefined}
                    variant='rounded'
                    sx={{
                      width: 50,
                      height: 75,
                      bgcolor: 'grey.700',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    <ImageIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 'medium',
                        fontSize: '1.1rem',
                        color: 'white',
                      }}
                    >
                      {season.name || `فصل ${season.seasonNumber}`}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{
                        color: 'grey.400',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <TheatersIcon fontSize='small' />
                      {season.episodeCount || '-'} قسمت | تاریخ پخش:{' '}
                      {season.airDate
                        ? new Date(season.airDate).toLocaleDateString('fa-IR')
                        : '-'}
                    </Typography>
                  </Box>
                  <Tooltip title='ویرایش اطلاعات و پوستر فصل'>
                    <IconButton
                      size='small'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSeason(season);
                      }}
                      sx={{
                        background: 'rgba(255,255,255,0.1)',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.2)',
                        },
                      }}
                    >
                      <EditIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                </Box>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  background: 'rgba(0,0,0,0.2)',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  p: 3,
                }}
              >
                {season.overview && (
                  <Typography
                    variant='body2'
                    paragraph
                    color='text.secondary'
                    sx={{ lineHeight: 1.7 }}
                  >
                    {season.overview}
                  </Typography>
                )}
                <Typography
                  variant='subtitle2'
                  sx={{
                    mb: 2,
                    fontWeight: 'bold',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <TheatersIcon fontSize='small' />
                  لیست قسمت‌ها:
                </Typography>
                {season.episodes && season.episodes.length > 0 ? (
                  <List
                    dense
                    disablePadding
                    sx={{
                      '& .MuiListItem-root': {
                        transition: 'all 0.3s ease',
                        borderRadius: 1,
                        '&:hover': {
                          background: 'rgba(255,255,255,0.05)',
                          transform: 'translateX(5px)',
                        },
                      },
                    }}
                  >
                    {season.episodes.map((episode) => (
                      <ListItem
                        key={episode.id || `ep-${episode.episodeNumber}`}
                        secondaryAction={
                          <Tooltip title='ویرایش اطلاعات و عکس قسمت'>
                            <IconButton
                              edge='end'
                              size='small'
                              onClick={() => handleEditEpisode(episode)}
                              sx={{
                                background: 'rgba(255,255,255,0.1)',
                                '&:hover': {
                                  background: 'rgba(255,255,255,0.2)',
                                },
                              }}
                            >
                              <EditIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        }
                      >
                        <ListItemAvatar sx={{ minWidth: 60 }}>
                          <Avatar
                            src={episode.stillPath || undefined}
                            variant='rounded'
                            sx={{
                              width: 80,
                              height: 45,
                              bgcolor: 'grey.700',
                              transition: 'transform 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.1)',
                              },
                            }}
                          >
                            <TheatersIcon fontSize='small' />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`قسمت ${episode.episodeNumber}: ${
                            episode.title || 'بدون عنوان'
                          }`}
                          secondary={`تاریخ پخش: ${
                            episode.airDate
                              ? new Date(episode.airDate).toLocaleDateString(
                                  'fa-IR'
                                )
                              : '-'
                          } | زمان: ${
                            episode.runtime ? `${episode.runtime} دقیقه` : '-'
                          }`}
                          primaryTypographyProps={{
                            noWrap: true,
                            color: 'grey.200',
                            fontWeight: 'medium',
                          }}
                          secondaryTypographyProps={{
                            color: 'grey.500',
                            fontSize: '0.75rem',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        color: 'grey.500',
                        fontStyle: 'italic',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <TheatersIcon />
                      قسمتی برای این فصل یافت نشد.
                    </Typography>
                  </Paper>
                )}
              </AccordionDetails>
            </Accordion>
          ))
      ) : (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Typography
            sx={{
              color: 'grey.500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <TvIcon />
            فصلی برای این سریال یافت نشد.
          </Typography>
        </Paper>
      )}
      {/* --- رندر مودال ویرایش فصل --- */}
      {editSeasonModalState.seasonData && (
        <EditSeasonModal
          open={editSeasonModalState.open}
          seasonData={editSeasonModalState.seasonData}
          onClose={handleCloseEditSeasonModal}
          onSuccess={handleUpdateSeasonSuccess}
        />
      )}
      {/* --------------------------- */}

      {/* --- رندر مودال ویرایش قسمت --- */}
      {editEpisodeModalState.episodeData && (
        <EditEpisodeModal
          open={editEpisodeModalState.open}
          episodeData={editEpisodeModalState.episodeData}
          onClose={handleCloseEditEpisodeModal}
          onSuccess={handleUpdateEpisodeSuccess}
        />
      )}
      {/* --------------------------- */}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          variant='filled'
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
