import { styled, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export const SectionTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: theme.spacing(4),
    position: 'relative',
    display: 'inline-block',
    paddingBottom: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: '60px',
      height: '3px',
      background: 'linear-gradient(to left, #ff4081 0%, #3f51b5 100%)',
      transition: 'width 0.3s ease-in-out',
    },
    '&:hover::after': {
      width: '100%',
    },
  
  }));
