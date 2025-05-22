"use client";
import {
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
} from "@mui/material";
import { menuItems } from "@/data/adminDashboaedMenuItems";
import Link from "next/link";
import theme from "@/styles/theme";
import { Logout } from "@mui/icons-material";

interface AdminDashboardSidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  pathname: string;
  // currentUser: User | null;
  handleLogout: () => void;
}

export default function AdminDashboardSidebar({
  drawerWidth,
  mobileOpen,
  handleDrawerToggle,
  pathname,
  // currentUser,
  handleLogout,
}: AdminDashboardSidebarProps) {
  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 2,
        }}
      >
        {" "}
        <Typography
          variant='h5'
          sx={{ color: "primary.main", fontWeight: "bold" }}
        >
          Parsflix Admin
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />
      <List sx={{ flexGrow: 1, px: 1 }}>
        {menuItems.map((item) => {
          // if(item.roles && currentUser && !item.roles.includes(currentUer.role as Role)){
          // return null
          // }
          return (
            <ListItem key={item.text} disablePadding sx={{ my: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.path}
                selected={
                  pathname === item.path ||
                  (pathname.startsWith(item.path) && item.path !== "/admin")
                }
                sx={{
                  borderRadius: "8px", // گرد کردن گوشه‌ها
                  "&.Mui-selected": {
                    backgroundColor: "rgba(229, 9, 20, 0.25)",
                    "&:hover": {
                      backgroundColor: "rgba(229, 9, 20, 0.35)",
                    },
                    "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
                      color: theme.palette.primary.main,
                    },
                  },
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{ color: "rgba(255, 255, 255, 0.7)", minWidth: "45px" }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />
      <List sx={{ px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: "8px",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)" },
            }}
          >
            <ListItemIcon
              sx={{ color: "rgba(255, 255, 255, 0.7)", minWidth: "45px" }}
            >
              <Logout />
            </ListItemIcon>
            <ListItemText
              primary='خروج'
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
      sx={{
        width: { lg: drawerWidth },
        flexShrink: { lg: 0 },
      }}
      aria-label='admin navigation'
    >
      <Drawer
        variant='temporary'
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" }, // تغییر به lg
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            bgcolor: "#101010",
            borderRight: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant='permanent'
        sx={{
          display: { xs: "none", lg: "block" }, // تغییر به lg
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            bgcolor: "#333333",
            borderRight: "none",
            position: "relative",
            shadowColor: "rgba(255, 255, 255, 0.12)",
            boxShadow: 2,
            height: "100vh",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
