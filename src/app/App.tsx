import { AppThemeProvider, useAppTheme } from '@contexts/AppThemeContext';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppRouter } from '@routes/AppRouter';

const AppShell = () => {
  const { muiTheme } = useAppTheme();

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  );
};

export const App = () => (
  <AppThemeProvider>
    <AppShell />
  </AppThemeProvider>
);
