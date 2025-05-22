"use client";
import { Typography, Box } from "@mui/material";

export default function AdminGenresPage() {
  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 3, fontWeight: "bold" }}>
        مدیریت ژانرها
      </Typography>
      <Typography sx={{ color: "grey.500" }}>
        جدول ژانرها و ابزارهای مدیریت در اینجا قرار خواهند گرفت...
      </Typography>
      {/* TODO: Add DataGrid and CRUD operations */}
    </Box>
  );
}
