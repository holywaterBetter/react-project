import { useAppTranslation } from '@hooks/useAppTranslation';
import { MenuItem, TextField } from '@mui/material';

export const LanguageSwitcher = () => {
  const { i18n } = useAppTranslation();

  return (
    <TextField
      select
      variant="outlined"
      size="small"
      value={i18n.language}
      onChange={(event) => {
        void i18n.changeLanguage(event.target.value);
      }}
      sx={{
        minWidth: 120,
        '& .MuiSelect-select': {
          color: 'var(--color-fg-default)',
          WebkitTextFillColor: 'var(--color-fg-default)'
        },
        '& .MuiSvgIcon-root': {
          color: 'var(--color-fg-muted)'
        }
      }}
      aria-label="language-switcher"
    >
      <MenuItem value="en">English</MenuItem>
      <MenuItem value="ko">한국어</MenuItem>
    </TextField>
  );
};
