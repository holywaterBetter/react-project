import { AppThemeProvider } from '@theme/AppThemeProvider';
import { AppRouter } from '@routes/AppRouter';

export const App = () => (
  <AppThemeProvider>
    <AppRouter />
  </AppThemeProvider>
);
