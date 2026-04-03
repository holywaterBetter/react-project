import { useAppTranslation } from '@hooks/useAppTranslation';
import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const NotFoundPage = () => {
  const { t } = useAppTranslation();

  return (
    <Stack spacing={2}>
      <Typography variant="h3">404</Typography>
      <Typography>{t('notFound.message')}</Typography>
      <Button variant="contained" component={RouterLink} to="/">
        {t('notFound.goHome')}
      </Button>
    </Stack>
  );
};
