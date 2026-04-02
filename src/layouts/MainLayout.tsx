import { LanguageSwitcher } from '@components/LanguageSwitcher';
import { useAppTheme } from '@contexts/AppThemeContext';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { AppBar, Box, Container, IconButton, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink, Outlet } from 'react-router-dom';

export const MainLayout = () => {
  const { mode, toggleMode } = useAppTheme();

  return (
    <Box className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AppBar position="static">
        <Toolbar className="flex gap-4">
          <Typography variant="h6" component="div" className="mr-3 flex-1">
            Enterprise React Starter
          </Typography>
          <RouterLink to="/" className="text-white no-underline hover:underline">
            Home
          </RouterLink>
          <RouterLink to="/about" className="text-white no-underline hover:underline">
            About
          </RouterLink>
          <LanguageSwitcher />
          <IconButton color="inherit" onClick={toggleMode} aria-label="toggle-theme-mode">
            {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container className="py-8">
        <Outlet />
      </Container>
    </Box>
  );
};
