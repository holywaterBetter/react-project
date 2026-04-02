import { createTheme, type PaletteMode, type Theme } from '@mui/material';
import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

type AppThemeContextValue = {
  mode: PaletteMode;
  muiTheme: Theme;
  toggleMode: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | undefined>(undefined);

export const AppThemeProvider = ({ children }: PropsWithChildren) => {
  const [mode, setMode] = useState<PaletteMode>('light');

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#0d6efd'
          }
        }
      }),
    [mode]
  );

  const value = useMemo(() => ({ mode, muiTheme, toggleMode }), [mode, muiTheme]);

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
};

export const useAppTheme = () => {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }

  return context;
};
