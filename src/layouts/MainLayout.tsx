import { LanguageSwitcher } from '@components/LanguageSwitcher';
import { useAppTheme } from '@contexts/AppThemeContext';
import { DevUserFabSwitcher } from '@features/auth/components/DevUserFabSwitcher';
import { useAppTranslation } from '@hooks/useAppTranslation';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { AppBar, Box, Button, Container, IconButton, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink, Outlet } from 'react-router-dom';

const logoLinkStyles = {
  display: 'inline-flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: 'inherit',
  px: 1,
  py: 0.5,
  borderRadius: 1.5,
  transition: 'background-color 180ms ease, color 180ms ease, box-shadow 180ms ease',
  '&:hover': {
    backgroundColor: 'action.hover'
  },
  '&:focus-visible': {
    outline: 'none',
    boxShadow: (theme: { palette: { primary: { main: string } } }) => `0 0 0 3px ${theme.palette.primary.main}55`
  },
  '&:active': {
    backgroundColor: 'action.selected'
  }
};

export const MainLayout = () => {
  const { mode, toggleMode } = useAppTheme();
  const { t } = useAppTranslation();

  return (
    <Box className="min-h-screen bg-canvas text-ink">
      <AppBar position="sticky" color="transparent" elevation={0}>
        <Toolbar className="mx-auto flex w-full max-w-6xl gap-4 px-0">
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            aria-label={t('layout.homeAriaLabel')}
            className="mr-3 flex-1 cursor-pointer font-semibold text-ink"
            sx={logoLinkStyles}
          >
            {t('layout.brand')}
          </Typography>
          <Button component={RouterLink} to="/organizations" color="inherit">
            {t('layout.nav.organizations')}
          </Button>
          <Button component={RouterLink} to="/organization/workforce-dashboard" color="inherit">
            {t('layout.nav.workforceDashboard')}
          </Button>
          <Button component={RouterLink} to="/organization/approval" color="inherit">
            {t('layout.nav.approval')}
          </Button>
          <LanguageSwitcher />
          <IconButton color="inherit" onClick={toggleMode} aria-label="toggle-theme-mode">
            {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className="py-8">
        <Outlet />
      </Container>
      <DevUserFabSwitcher />
    </Box>
  );
};
