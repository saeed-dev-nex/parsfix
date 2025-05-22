import React from "react";
import {
  Avatar,
  Box,
  Divider,
  Drawer,
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
  Home,
  Logout,
  People,
  Settings,
  Visibility,
} from "@mui/icons-material";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { User } from "@/types";

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  currentUser: User;
  handleLogout: () => void;
}
const menuItems = [
  { text: "اطلاعات کلی", icon: <Edit />, path: "/profile" },
  {
    text: "علاقه‌مندی‌ها",
    icon: <Favorite />,
    path: "/profile/favorites",
  },
  {
    text: "لیست تماشا",
    icon: <Visibility />,
    path: "/profile/watchlist",
  },
  { text: "افراد محبوب", icon: <People />, path: "/profile/persons" },
  { text: "تنظیمات", icon: <Settings />, path: "/profile/setting" },
  {text:'بازگشت به صفحه اصلی', icon:<Home/>, path:'/'}
];

function Sidebar({
  drawerWidth,
  mobileOpen,
  handleDrawerToggle,
  handleLogout,
  currentUser,
}: SidebarProps) {
  const theme = useTheme();
  const pathname = usePathname();

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.3)",
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: "primary.main",
            fontWeight: "900",
            size: "12px",
            textAlign: "center",
            // textWrap: "nowrap",
          }}
          src={currentUser?.profilePictureUrl || undefined}
          alt={currentUser?.name || currentUser?.email || ""}
        >
          {!currentUser?.profilePictureUrl && currentUser?.name ? (
            currentUser.name.charAt(0).toUpperCase()
          ) : (
            <AccountCircle />
          )}
        </Avatar>
        <Typography
          variant='subtitle1'
          noWrap
          sx={{ color: "white", fontWeight: "medium" }}
        >
          {currentUser?.name || currentUser?.email}
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              href={item.path}
              selected={pathname === item.path} // هایلایت کردن آیتم فعال
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "rgba(229, 9, 20, 0.2)", // رنگ پس‌زمینه قرمز کم‌رنگ
                  "&:hover": {
                    backgroundColor: "rgba(229, 9, 20, 0.3)",
                  },
                  "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
                    color: theme.palette.primary.main, // رنگ آیکن و متن قرمز
                  },
                },
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                },
                py: 1.5, // کمی ارتفاع بیشتر
              }}
            >
              <ListItemIcon
                sx={{ color: "rgba(255, 255, 255, 0.7)", minWidth: "40px" }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{ color: "rgba(255, 255, 255, 0.9)" }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ py: 1.5 }}>
            <ListItemIcon
              sx={{ color: "rgba(255, 255, 255, 0.7)", minWidth: "40px" }}
            >
              <Logout />
            </ListItemIcon>
            <ListItemText
              primary='خروج از حساب'
              sx={{ color: "rgba(255, 255, 255, 0.9)" }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      component='nav'
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 }, height:'100vh' }}
      aria-label='mailbox folders'
    >
      {/* Drawer موقت برای موبایل */}
      <Drawer
        variant='temporary'
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile.
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            bgcolor: "#181818",
            borderRight: "1px solid rgba(255, 255, 255, 0.12)",
          }, // استایل Drawer موبایل
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Drawer دائمی برای دسکتاپ */}
      <Drawer
        variant='permanent'
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            bgcolor: "#181818",
            borderRight: "1px solid rgba(255, 255, 255, 0.12)",
            position: "relative",
          }, // استایل Drawer دسکتاپ
          height:'100vh'
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}

export default Sidebar;
