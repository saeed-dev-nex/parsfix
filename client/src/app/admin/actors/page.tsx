"use client";
import { Typography, Box } from '@mui/material';

export default function AdminَActorsPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>مدیریت بازیگران</Typography>
      <Typography sx={{color:'grey.500'}}>جدول بازیگران و ابزارهای مدیریت در اینجا قرار خواهند گرفت...</Typography>
       {/* TODO: Add DataGrid and CRUD operations */}
    </Box>
  );
}