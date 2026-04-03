import { LanguageSwitcher } from '@components/LanguageSwitcher';
import { useAppTheme } from '@contexts/AppThemeContext';
import { DevUserModeSwitcher } from '@features/auth/components/DevUserModeSwitcher';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { AppBar, Box, Button, Container, IconButton, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink, Outlet } from 'react-router-dom';

export const MainLayout = () => {
  const { mode, toggleMode } = useAppTheme();

  return (
    <Box className="min-h-screen bg-canvas text-ink">
      <AppBar position="sticky" color="transparent" elevation={0}>
        <Toolbar className="mx-auto flex w-full max-w-6xl gap-4 px-0">
          <Typography variant="h6" component="div" className="mr-3 flex-1 font-semibold text-ink">
            Enterprise React Starter
          </Typography>
          <Button component={RouterLink} to="/" color="inherit">
            Home
          </Button>
          <Button component={RouterLink} to="/about" color="inherit">
            About
          </Button>
          <Button component={RouterLink} to="/organizations" color="inherit">
            Organizations
          </Button>
          <Button component={RouterLink} to="/organization/workforce-dashboard" color="inherit">
            Workforce Dashboard
          </Button>
          <Button component={RouterLink} to="/organization/workforce-insight" color="inherit">
            Workforce Insight
          </Button>
          <Button component={RouterLink} to="/organization/approval" color="inherit">
            Approval
          </Button>
          <DevUserModeSwitcher />
          <LanguageSwitcher />
          <IconButton color="inherit" onClick={toggleMode} aria-label="toggle-theme-mode">
            {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className="py-8">
        <Outlet />
      </Container>
    </Box>
  );
};
