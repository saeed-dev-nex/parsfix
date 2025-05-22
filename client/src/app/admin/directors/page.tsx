"use client";
import { Typography, Box } from "@mui/material";

export default function AdminDirectorsPage() {
  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 3, fontWeight: "bold" }}>
        مدیریت کارگردان ها
      </Typography>
      <Typography sx={{ color: "grey.500" }}>
        جدول کارگردان و ابزارهای مدیریت در اینجا قرار خواهند گرفت...
      </Typography>
      {/* TODO: Add DataGrid and CRUD operations */}
    </Box>
  );
}
