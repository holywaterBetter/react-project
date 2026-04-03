import { AppRouter } from '@routes/AppRouter';
import { AppThemeProvider } from '@theme/AppThemeProvider';

export const App = () => (
  <AppThemeProvider>
    <AppRouter />
  </AppThemeProvider>
);
