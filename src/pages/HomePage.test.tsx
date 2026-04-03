import '@app/i18n';
import { AppThemeProvider } from '@contexts/AppThemeContext';
import { HomePage } from '@pages/HomePage';
import { render, screen } from '@testing-library/react';

describe('HomePage', () => {
  it('renders localized heading', () => {
    render(
      <AppThemeProvider>
        <HomePage />
      </AppThemeProvider>
    );

    expect(screen.getByText('Enterprise Starter Home')).toBeInTheDocument();
  });
});
