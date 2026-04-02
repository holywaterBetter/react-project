
import { DemoStatusCard } from '@components/DemoStatusCard';
import { useAppTheme } from '@contexts/AppThemeContext';
import { useAppTranslation } from '@hooks/useAppTranslation';
import { Alert, Chip, Stack, Typography } from '@mui/material';
import { useState } from 'react';

export const HomePage = () => {
  const [message, setMessage] = useState<string>('');
  const { mode } = useAppTheme();
  const { t } = useAppTranslation();

  return (
    <Stack spacing={3}>
      <Typography variant="h4">{t('home.title')}</Typography>
      <Typography className="text-slate-600">{t('home.subtitle')}</Typography>

      <div className="grid gap-4 md:grid-cols-3">
        <Chip color="primary" label={`Theme mode: ${mode}`} />
        <Chip color="secondary" label="MUI + Tailwind" />
        <Chip color="success" label="React 19 + TS" />
      </div>

      <DemoStatusCard
        title={t('home.demoCard.title')}
        description={t('home.demoCard.description')}
        onAction={() => setMessage(t('home.demoCard.actionMessage'))}
      />

      {message ? <Alert severity="success">{message}</Alert> : null}
    </Stack>
  );
};
