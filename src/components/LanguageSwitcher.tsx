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
      sx={{ minWidth: 110, bgcolor: 'white', borderRadius: 1 }}
      aria-label="language-switcher"
    >
      <MenuItem value="en">English</MenuItem>
      <MenuItem value="ko">한국어</MenuItem>
    </TextField>
  );
};
