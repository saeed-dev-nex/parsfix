// client/src/app/(admin)/admin/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Icon,
  Skeleton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Fade,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
} from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store/store';
import {
  clearDashboardError,
  fetchDashboardStats,
  fetchRecentActivities,
  selectDashboardError,
  selectDashboardIsLoadingActivities,
  selectDashboardIsLoadingStats,
  selectDashboardStats,
  selectRecentMovies,
  selectRecentSeries,
  selectRecentUsers,
} from '@/store/slices/dashboardSlice';
import { selectCurrentUser } from '@/store/slices/authSlice';
import {
  AdminPanelSettings,
  PendingActions,
  SupervisorAccount,
} from '@mui/icons-material';
import { Role } from '@/types';
import Link from 'next/link';
import LinearProgress from '@mui/material/LinearProgress';
import StatCard from '@/components/admin/Dashboard/StatsCard';

export default function AdminDashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState(0);

  const stats = useSelector(selectDashboardStats);
  const recentUsers = useSelector(selectRecentUsers);
  const recentMovies = useSelector(selectRecentMovies);
  const recentSeries = useSelector(selectRecentSeries);
  console.log('🚀 ~ AdminDashboardPage ~ recentMovies:', recentMovies);
  const isLoadingStats = useSelector(selectDashboardIsLoadingStats);
  const isLoadingActivities = useSelector(selectDashboardIsLoadingActivities);
  const error = useSelector(selectDashboardError);
  const currentUser = useSelector(selectCurrentUser);

  const recentActivities = [
    {
      users: [...recentUsers],
      movies: [...recentMovies],
      series: [...recentSeries],
    },
  ];
  console.log('🚀 ~ AdminDashboardPage ~ recentActivities:', recentActivities);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  console.log('recent Series -----> ', recentSeries);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchRecentActivities());
    return () => {
      dispatch(clearDashboardError());
    }; // پاک کردن خطا هنگام خروج
  }, [dispatch]);
  console.log('🚀 ~ AdminDashboardPage ~ stats:', stats);

  return (
    <Box>
      <Typography
        variant='h4'
        sx={{ mb: 4, fontWeight: 'bold' }}
      >
        داشبورد مدیریت
      </Typography>
      {error && (
        <Alert
          severity='error'
          sx={{ mb: 2 }}
          onClose={() => dispatch(clearDashboardError())}
        >
          {error.message || 'خطا در واکشی اطلاعات داشبورد'}
        </Alert>
      )}

      <Grid
        container
        spacing={2}
        sx={{ width: '100%' }}
      >
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard
            title='تعداد فیلم‌ها'
            value={stats?.moviesCount || '0'}
            icon={<MovieIcon />}
            color='#e50914'
            isLoading={isLoadingStats}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard
            title='تعداد کل سریال‌ها'
            value={stats?.seriesCount || '0'}
            icon={<TvIcon />}
            color='#f5c518'
            isLoading={isLoadingStats}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard
            title=' تعداد کاربران سایت'
            value={stats?.userCountNormal || '0'}
            icon={<PeopleIcon />}
            color='#1e88e5'
            isLoading={isLoadingStats}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard
            title='تعداد ژانرها'
            value={stats?.genreCount || '0'}
            icon={<CategoryIcon />}
            color='#4caf50'
            isLoading={isLoadingStats}
          />
        </Grid>
        {/* فقط برای سوپر ادمین */}
        {currentUser?.role === Role.SUPER_ADMIN && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <StatCard
                title='ادمین‌ها'
                value={stats?.userCountAdmin || '0'}
                icon={<AdminPanelSettings />}
                color='#ffa726'
                isLoading={isLoadingStats}
              />
            </Grid>
          </>
        )}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          {/* این مقدار بر اساس نقش محاسبه شده */}
          <Link href='/admin/movies'>
            <StatCard
              title='فیلم‌های در انتظار تایید'
              value={stats?.pendingMovieCount || '0'}
              icon={<PendingActions />}
              color='#ef5350'
              isLoading={isLoadingStats}
            />
          </Link>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard
            title='سریال‌های در انتظار تایید'
            value={stats?.pendingSeriescCount || '0'}
            icon={<PendingActions />}
            color='#ef5350'
            isLoading={isLoadingStats}
          />
        </Grid>
      </Grid>
      {/* بخش فعالیت‌های اخیر */}
      <Box sx={{ mt: 5 }}>
        <Typography
          variant='h5'
          sx={{ mb: 3, fontWeight: 'bold' }}
        >
          فعالیت‌های اخیر
        </Typography>

        {isLoadingActivities ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card
            sx={{
              borderRadius: 3,
              background:
                'linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(30, 30, 30, 0.9))',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4)',
                transform: 'translateY(-5px)',
              },
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant='fullWidth'
                textColor='primary'
                indicatorColor='primary'
                sx={{
                  '& .MuiTab-root': {
                    color: 'grey.400',
                    fontWeight: 'medium',
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                      color: 'white',
                      fontWeight: 'bold',
                    },
                    '&:hover': {
                      color: 'white',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                    background: 'linear-gradient(90deg, #e50914, #ff5f6d)',
                  },
                }}
              >
                <Tab
                  label='آخرین کاربران'
                  icon={<PeopleIcon />}
                  iconPosition='start'
                />
                <Tab
                  label='آخرین فیلم‌ها'
                  icon={<MovieIcon />}
                  iconPosition='start'
                />
                <Tab
                  label='آخرین سریال ها'
                  icon={<TvIcon />}
                  iconPosition='start'
                />
              </Tabs>
            </Box>

            <CardContent sx={{ p: 3 }}>
              {/* تب کاربران */}
              {activeTab === 0 && (
                <Fade
                  in={activeTab === 0}
                  timeout={500}
                >
                  <Box>
                    <List dense>
                      {recentUsers.length > 0 ? (
                        recentUsers.map((user) => (
                          <ListItem
                            key={user.id}
                            disableGutters
                            divider
                            sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                          >
                            <ListItemText
                              primary={user.name || user.email || 'بدون نام'}
                              secondary={`ثبت‌نام در: ${new Date(
                                user.createdAt
                              ).toLocaleDateString('fa-IR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}`}
                              primaryTypographyProps={{ fontWeight: 'medium' }}
                              secondaryTypographyProps={{ color: 'grey.500' }}
                            />
                          </ListItem>
                        ))
                      ) : (
                        <Typography
                          sx={{ color: 'grey.600', textAlign: 'center', py: 2 }}
                        >
                          کاربر جدیدی ثبت‌نام نکرده است.
                        </Typography>
                      )}
                    </List>
                  </Box>
                </Fade>
              )}

              {/* تب فیلم‌ها */}
              {activeTab === 1 && (
                <Fade
                  in={activeTab === 1}
                  timeout={500}
                >
                  <Box>
                    <List dense>
                      {recentMovies.length > 0 ? (
                        recentMovies.map((movie) => (
                          <ListItem
                            key={movie.id}
                            disableGutters
                            divider
                            sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                          >
                            <ListItemText
                              primary={movie.title || 'بدون عنوان'}
                              secondary={`توسط: ${
                                movie.addedBy?.name || 'نامشخص'
                              } | وضعیت: ${
                                movie.status || '-'
                              } | در: ${new Date(
                                movie.createdAt
                              ).toLocaleDateString('fa-IR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}`}
                              primaryTypographyProps={{
                                fontWeight: 'medium',
                                noWrap: true,
                              }}
                              secondaryTypographyProps={{
                                color: 'grey.500',
                                fontSize: '0.8rem',
                              }}
                            />
                          </ListItem>
                        ))
                      ) : (
                        <Typography
                          sx={{ color: 'grey.600', textAlign: 'center', py: 2 }}
                        >
                          فیلم جدیدی اضافه نشده است.
                        </Typography>
                      )}
                    </List>
                  </Box>
                </Fade>
              )}
              {activeTab === 2 && (
                <Fade
                  in={activeTab === 2}
                  timeout={500}
                >
                  <Box>
                    <List dense>
                      {recentSeries.length > 0 ? (
                        recentSeries.map((series) => (
                          <ListItem
                            key={series.id}
                            disableGutters
                            divider
                            sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                          >
                            <ListItemText
                              primary={series.title || 'بدون عنوان'}
                              secondary={`توسط: ${
                                series.addedBy?.name || 'نامشخص'
                              } | وضعیت: ${
                                series.status || '-'
                              } | در: ${new Date(
                                series.createdAt
                              ).toLocaleDateString('fa-IR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}`}
                              primaryTypographyProps={{
                                fontWeight: 'medium',
                                noWrap: true,
                              }}
                              secondaryTypographyProps={{
                                color: 'grey.500',
                                fontSize: '0.8rem',
                              }}
                            />
                          </ListItem>
                        ))
                      ) : (
                        <Typography
                          sx={{ color: 'grey.600', textAlign: 'center', py: 2 }}
                        >
                          سریال جدیدی اضافه نشده است.
                        </Typography>
                      )}
                    </List>
                  </Box>
                </Fade>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
