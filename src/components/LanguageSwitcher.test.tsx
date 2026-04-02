import { LanguageSwitcher } from '@components/LanguageSwitcher';
import '@app/i18n';
import { render, screen } from '@testing-library/react';

describe('LanguageSwitcher', () => {
  it('renders language options', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByLabelText('language-switcher')).toBeInTheDocument();
  });
});
