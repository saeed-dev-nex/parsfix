"use client";
import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import {
  AccountCircle,
  Edit,
  Favorite,
  Logout,
  Menu,
  People,
  Settings,
  Visibility,
} from "@mui/icons-material";
import { Role, User } from "@/types";
import Sidebar from "@/components/layout/profile.layout/Sidebar";
import { useAuthProtection } from "@/hooks/useAuthProtection";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/store/slices/authSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
const drawerWidth = 240;
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading: isAuthLoading, currentUser } = useAuthProtection({
    allowedRoles: [Role.USER, Role.ADMIN, Role.SUPER_ADMIN], // فقط ادمین و سوپرادمین
    redirectTo: "/", // اگر نقش مجاز نبود به اینجا برو
  });
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    await dispatch(logoutUser());
  };
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgColor: "#14141414" }}>
      <CssBaseline />
      <AppBar
        position='fixed'
        sx={{
          width: { md: `calc(100%-${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "rgba(20,20,20,0.85)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            bgcolor: "rgba(20,20,20,0.9)",
            backdropFilter: "blur(12px)",
          },
        }}
      >
        <Toolbar>
          <IconButton
            color='inherit'
            aria-label='open drawer'
            edge='start'
            sx={{
              mr: 2,
              display: { md: "none" },
            }}
            onClick={handleDrawerToggle}
            // onClick={}
          >
            <Menu />
          </IconButton>
          <Typography variant='h6' noWrap component='div'>
            پروفایل کاربر
          </Typography>
        </Toolbar>
      </AppBar>
      <Sidebar
        drawerWidth={drawerWidth}
        handleDrawerToggle={handleDrawerToggle}
        mobileOpen={mobileOpen}
        currentUser={currentUser as User}
        handleLogout={handleLogout}
      />
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          color: "white",
          background:
            "linear-gradient(to bottom right, rgba(20,20,20,0.8), rgba(30,30,30,0.8))",
          minHeight: "100vh",
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
