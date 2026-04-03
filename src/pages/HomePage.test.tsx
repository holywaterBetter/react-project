import '@app/i18n';
import { AppThemeProvider } from '@contexts/AppThemeContext';
import { DevUserModeProvider } from '@features/auth/context/DevUserModeContext';
import { HomePage } from '@pages/HomePage';
import { render, screen } from '@testing-library/react';

describe('HomePage', () => {
  it('renders workforce insight dashboard content on home', () => {
    render(
      <AppThemeProvider>
        <DevUserModeProvider>
          <HomePage />
        </DevUserModeProvider>
      </AppThemeProvider>
    );

    expect(screen.getByText('인력 인사이트 허브')).toBeInTheDocument();
  });
});
