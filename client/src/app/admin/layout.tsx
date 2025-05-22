'use client';
import AdminDashboardSidebar from '@/components/layout/admin/AdminDashboardSidebar';
import { menuItems } from '@/data/adminDashboaedMenuItems';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { logoutUser } from '@/store/slices/authSlice';
import { AppDispatch } from '@/store/store';
import theme from '@/styles/theme';
import { Role } from '@/types';
import { Menu, Monitor, SmartDisplay } from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  CircularProgress,
  CssBaseline,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  Paper,
  Fade,
} from '@mui/material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const drawerWidth = 260;
  // Hooks
  const { isLoading: isAuthLoading, currentUser } = useAuthProtection({
    allowedRoles: [Role.ADMIN, Role.SUPER_ADMIN],
    //@ts-ignore
    fallbackRedirectTo: '/',
  });
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  // Local States
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/login'); // هدایت به لاگین پس از خروج
  };
  if (isAuthLoading || !currentUser) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: '#101010',
        }}
      >
        <CircularProgress color='primary' />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        bgcolor: '#101010',
        overFlow: 'hidden',
      }}
    >
      <CssBaseline />
      <AppBar
        position='fixed'
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          bgcolor: 'rgba(24,24,24,0.7)',
          background:
            'linear-gradient(90deg, rgba(24,24,24,0.85) 60%, #232526 100%)',
          backdropFilter: 'blur(14px)',
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
          borderBottom: '1px solid rgba(255,255,255,0.10)',
          transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <IconButton
            color='inherit'
            aria-label='open drawer'
            edge='start'
            sx={{ mr: 2, display: { lg: 'none' } }}
            onClick={handleDrawerToggle}
          >
            <Menu />
          </IconButton>
          <Typography
            variant='h6'
            noWrap
            component='div'
            sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 0.5 }}
          >
            {menuItems.find(
              (item) =>
                pathname === item.path ||
                (pathname.startsWith(item.path) && item.path !== '/admin')
            )?.text || 'پنل مدیریت پارسفلیکس'}
          </Typography>
          <Tooltip title='نمایش سایت'>
            <Link href='/'>
              <IconButton
                color='primary'
                sx={{ bgcolor: 'rgba(229,9,20,0.08)', mr: 1 }}
              >
                <Monitor />
              </IconButton>
            </Link>
          </Tooltip>
          <Tooltip title={currentUser.email || ''}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                ml: 1,
                border: '2px solid #e50914',
                boxShadow: '0 2px 8px 0 rgba(229,9,20,0.15)',
              }}
              src={currentUser.profilePictureUrl || undefined}
              alt={currentUser.name || currentUser.email || ''}
            />
          </Tooltip>
        </Toolbar>
      </AppBar>
      <AdminDashboardSidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        pathname={pathname}
        // currentUser,
        handleLogout={handleLogout}
      />
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          color: 'white',
          background: 'linear-gradient(135deg, #181818 0%, #232526 100%)',
          minHeight: '100vh',
          transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
          overflowY:'auto'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
