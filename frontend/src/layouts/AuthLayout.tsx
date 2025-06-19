import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { MusicNote as MusicNoteIcon } from '@mui/icons-material';

const AuthLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        py: 6,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MusicNoteIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
            <Typography
              variant="h4"
              component="h1"
              color="primary.main"
              fontWeight="bold"
            >
              Music Education Scheduler
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary" align="center">
            Schedule, manage, and track your music education journey
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: isMobile ? 3 : 5,
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Outlet />
        </Paper>
        
        <Box
          sx={{
            mt: 4,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Music Education Scheduler. All rights reserved.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Easy scheduling for music teachers and students
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout;