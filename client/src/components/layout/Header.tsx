// client/src/components/layout/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link'; // استفاده از Link به‌روز شده
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { selectCurrentUser, selectIsLoggedIn } from '@/store/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { logoutUser } from '../../store/slices/authSlice';
import { Avatar } from '@mui/material';
import { User } from '@/types';
import Image from 'next/image';

const NavLinkStyles = {
  color: 'inherit',
  textDecoration: 'none',
  marginRight: 2,
  '&:hover': {
    color: 'grey.400',
  },
};

const drawerWidth = 240;

export default function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const currentUser: User | null = useSelector(selectCurrentUser);

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();

  const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleUserMenuClose = () => {
    setAnchorElUser(null);
  };
  const handleLogout = () => {
    dispatch(logoutUser());
    handleUserMenuClose(); /* TODO: logout logic */
  };
  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawerContent = (
    <Box
      onClick={handleDrawerToggle}
      sx={{ textAlign: 'center', bgcolor: 'background.paper', height: '100%' }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1,
        }}
      >
        {/* <Typography
          variant='h6'
          sx={{ my: 2, color: "primary.main", fontWeight: "700" }}
        >
          PARSFLIX
        </Typography> */}
        <Image
          src='/text_logo.png'
          alt='PARSFLIX'
          width={120}
          height={35}
          priority
        />
        <IconButton>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {isLoggedIn ? (
          <>
            {/* لینک های اصلی در Drawer - بدون legacyBehavior/passHref */}
            <Link href='/movies'>
              <ListItem disablePadding>
                <ListItemButton sx={{ textAlign: 'right' }}>
                  <ListItemText primary='فیلم‌ها' />
                </ListItemButton>
              </ListItem>
            </Link>
            <Link href='/series'>
              <ListItem disablePadding>
                <ListItemButton sx={{ textAlign: 'right' }}>
                  <ListItemText primary='سریال‌ها' />
                </ListItemButton>
              </ListItem>
            </Link>
            <Link href='/categories'>
              <ListItem disablePadding>
                <ListItemButton sx={{ textAlign: 'right' }}>
                  <ListItemText primary='دسته‌بندی‌ها' />
                </ListItemButton>
              </ListItem>
            </Link>
            <Divider sx={{ my: 1 }} />
            <Link href='/profile'>
              <ListItem disablePadding>
                <ListItemButton sx={{ textAlign: 'right' }}>
                  <ListItemText primary='پروفایل' />
                </ListItemButton>
              </ListItem>
            </Link>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{ textAlign: 'right', color: 'error.main' }}
              >
                <ListItemText primary='خروج' />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <Link href='/auth/login'>
            <ListItem disablePadding>
              <ListItemButton sx={{ textAlign: 'right' }}>
                <ListItemText primary='ورود' />
              </ListItemButton>
            </ListItem>
          </Link>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position='sticky'
        sx={{ bgcolor: 'background.default' }}
      >
        <Toolbar>
          {/* لوگو */}
          <Typography
            variant='h6'
            component='div'
            sx={{ flexGrow: 1, color: 'primary.main', fontWeight: '700' }}
          >
            <Link
              href='/'
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Image
                src='/text_logo.png'
                alt='PARSFLIX'
                width={120}
                height={35}
                priority
              />
            </Link>
          </Typography>

          {/* لینک‌های ناوبری دسکتاپ - بدون legacyBehavior/passHref */}
          {isLoggedIn && (
            <Box
              sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}
            >
              <Link href='/movies'>
                <Button
                  sx={NavLinkStyles}
                  color='inherit'
                >
                  فیلم‌ها
                </Button>
              </Link>
              <Link href='/series'>
                <Button
                  sx={NavLinkStyles}
                  color='inherit'
                >
                  سریال‌ها
                </Button>
              </Link>
              <Link href='/categories'>
                <Button
                  sx={NavLinkStyles}
                  color='inherit'
                >
                  دسته‌بندی‌ها
                </Button>
              </Link>
            </Box>
          )}

          {/* بخش کاربر */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginLeft: { xs: 1, md: 2 },
            }}
          >
            {isLoggedIn ? (
              <>
                <Typography
                  sx={{ display: { xs: 'none', sm: 'block' }, mr: 1 }}
                >
                  {currentUser?.name}
                </Typography>
                <div>
                  <IconButton
                    size='large'
                    onClick={handleUserMenu}
                    color='inherit'
                  >
                    {currentUser && currentUser?.profilePictureUrl ? (
                      <Avatar src={currentUser.profilePictureUrl} />
                    ) : (
                      <AccountCircle />
                    )}
                  </IconButton>

                  <Menu
                    id='menu-appbar-user'
                    anchorEl={anchorElUser}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={Boolean(anchorElUser)}
                    onClose={handleUserMenuClose}
                  >
                    {/* لینک پروفایل در منو - بدون legacyBehavior/passHref */}
                    <Link href='/profile'>
                      <MenuItem onClick={handleUserMenuClose}>پروفایل</MenuItem>
                    </Link>
                    {(currentUser?.role === 'ADMIN' ||
                      currentUser?.role === 'SUPER_ADMIN') && (
                      <Link href='/admin'>
                        <MenuItem onClick={handleUserMenuClose}>
                          پنل مدیریت
                        </MenuItem>
                      </Link>
                    )}
                    <MenuItem onClick={handleLogout}>خروج</MenuItem>
                  </Menu>
                </div>
              </>
            ) : (
              // لینک دکمه ورود - بدون legacyBehavior/passHref
              <Link href='/login'>
                <Button
                  variant='contained'
                  color='primary'
                >
                  ورود
                </Button>
              </Link>
            )}
          </Box>

          {/* دکمه منوی موبایل */}
          {isLoggedIn && (
            <IconButton
              color='inherit'
              aria-label='open drawer'
              edge='end'
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' }, marginLeft: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component='nav'>
        <Drawer
          variant='temporary'
          anchor='right'
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          transitionDuration={{
            enter: theme.transitions.duration.enteringScreen,
            exit: theme.transitions.duration.leavingScreen,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.paper',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>
    </>
  );
}
