import {
  Box,
  Card,
  CardContent,
  Fade,
  Icon,
  LinearProgress,
  Skeleton,
  Typography,
} from '@mui/material';

const StatCard = ({
  title,
  value,
  icon,
  color = '#e50914',
  isLoading = false,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  isLoading?: boolean;
}) => (
  <Fade
    in
    timeout={600}
  >
    <Card
      sx={{
        position: 'relative',
        backdropFilter: 'blur(10px)',
        background: `linear-gradient(165deg, rgba(255,255,255,0.05) 0%, rgba(20,20,28,0.9) 100%)`,
        border: `1px solid ${color}22`,
        color: 'white',
        width: '100%',
        minHeight: 140,
        borderRadius: 3,
        overflow: 'visible',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 'inherit',
          padding: '1px',
          background: `linear-gradient(135deg, ${color}44 0%, transparent 50%)`,
          WebkitMask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        },
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 20px 40px -12px ${color}40`,
          '& .icon-container': {
            transform: 'scale(1.1) translateY(-2px)',
            boxShadow: `0 8px 24px -6px ${color}66`,
          },
        },
      }}
    >
      <CardContent sx={{ p: 3, pb: '24px !important' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ flex: 1, mt: 1 }}>
            <Typography
              variant='body2'
              sx={{
                color: 'grey.400',
                fontWeight: 500,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                mb: 1,
              }}
            >
              {title}
            </Typography>

            {isLoading ? (
              <Skeleton
                variant='text'
                width={90}
                height={48}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 1,
                }}
              />
            ) : (
              <Typography
                variant='h3'
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-1px',
                  color: 'white',
                  lineHeight: 1.2,
                }}
              >
                {value}
              </Typography>
            )}
          </Box>

          <Box
            className='icon-container'
            sx={{
              width: 52,
              height: 52,
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${color}88 0%, ${color}44 100%)`,
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: `1px solid ${color}33`,
              boxShadow: `0 6px 20px -6px ${color}66`,
            }}
          >
            <Icon sx={{ fontSize: 28, color: '#fff' }}>{icon}</Icon>
          </Box>
        </Box>
      </CardContent>

      {isLoading && (
        <LinearProgress
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 3,
            bgcolor: `${color}11`,
            '& .MuiLinearProgress-bar': {
              bgcolor: color,
            },
          }}
        />
      )}
    </Card>
  </Fade>
);

export default StatCard;
