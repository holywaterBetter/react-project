import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { CssBaseline, ThemeProvider, type Theme } from '@mui/material';

import { createAppTheme } from '@theme/createAppTheme';
import { applyThemeMode, getPreferredThemeMode, persistThemeMode } from '@theme/themeMode';
import { type ThemeMode } from '@theme/tokens';

type AppThemeContextValue = {
  mode: ThemeMode;
  muiTheme: Theme;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | undefined>(undefined);

export const AppThemeProvider = ({ children }: PropsWithChildren) => {
  const [mode, setMode] = useState<ThemeMode>(() => getPreferredThemeMode());

  useEffect(() => {
    applyThemeMode(mode);
    persistThemeMode(mode);
  }, [mode]);

  const muiTheme = useMemo(() => createAppTheme(mode), [mode]);

  const value = useMemo(
    () => ({
      mode,
      muiTheme,
      setMode,
      toggleMode: () => {
        setMode((previousMode) => (previousMode === 'light' ? 'dark' : 'light'));
      }
    }),
    [mode, muiTheme]
  );

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }

  return context;
};
