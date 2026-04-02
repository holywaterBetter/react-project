import '@app/i18n';
import { AppThemeProvider } from '@contexts/AppThemeContext';
import { ThemeProvider, createTheme } from '@mui/material';
import { HomePage } from '@pages/HomePage';
import { render, screen } from '@testing-library/react';

describe('HomePage', () => {
  it('renders localized heading', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <AppThemeProvider>
          <HomePage />
        </AppThemeProvider>
      </ThemeProvider>
    );

    expect(screen.getByText('Enterprise Starter Home')).toBeInTheDocument();
  });
});
