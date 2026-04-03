import { DevUserModeProvider } from '@features/auth/context/DevUserModeContext';
import { AppRouter } from '@routes/AppRouter';
import { AppThemeProvider } from '@theme/AppThemeProvider';

export const App = () => (
  <AppThemeProvider>
    <DevUserModeProvider>
      <AppRouter />
    </DevUserModeProvider>
  </AppThemeProvider>
);
