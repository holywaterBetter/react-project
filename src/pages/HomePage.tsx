import { DemoStatusCard } from '@components/DemoStatusCard';
import { useAppTheme } from '@contexts/AppThemeContext';
import { useAppTranslation } from '@hooks/useAppTranslation';
import { Alert, Box, Button, Card, Chip, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

export const HomePage = () => {
  const [message, setMessage] = useState<string>('');
  const [workspaceName, setWorkspaceName] = useState('Operations Dashboard');
  const { mode } = useAppTheme();
  const { t } = useAppTranslation();

  return (
    <Stack spacing={4}>
      <Box className="rounded-[var(--radius-xl)] border border-line bg-surface p-6 shadow-sm md:p-8">
        <Stack spacing={3}>
          <div className="flex flex-wrap gap-2">
            <Chip color="primary" label={`Theme mode: ${mode}`} />
            <Chip color="secondary" variant="outlined" label="MUI + Tailwind" />
            <Chip color="success" variant="outlined" label="CSS Variables" />
          </div>
          <Typography variant="h3">{t('home.title')}</Typography>
          <Typography className="max-w-3xl text-ink-muted">{t('home.subtitle')}</Typography>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <TextField
              fullWidth
              label="Workspace name"
              value={workspaceName}
              onChange={(event) => {
                setWorkspaceName(event.target.value);
              }}
              helperText="This TextField inherits radius, borders, background, and font tokens from the shared theme."
            />
            <Button
              variant="contained"
              onClick={() => setMessage(`${workspaceName} ${t('home.demoCard.actionMessage')}`)}
              sx={{ minWidth: 180 }}
            >
              Save Theme Preview
            </Button>
          </div>
        </Stack>
      </Box>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <DemoStatusCard
          title={t('home.demoCard.title')}
          description={t('home.demoCard.description')}
          onAction={() => setMessage(t('home.demoCard.actionMessage'))}
        />

        <Card className="rounded-xl border border-line bg-surface-raised p-6 shadow-sm">
          <Stack spacing={2.5}>
            <Typography variant="h6">Theme Foundation Checklist</Typography>
            <Typography className="text-ink-muted">
              Light and dark modes now share one token contract across CSS variables, MUI theme overrides, and
              Tailwind utilities.
            </Typography>
            <ul className="space-y-2 text-sm text-ink-muted">
              <li>Color primitives and semantic tokens</li>
              <li>Typography scale with Korean and English friendly stack</li>
              <li>Spacing, radius, elevation, and z-index scales</li>
              <li>Mode toggle with persisted preference</li>
            </ul>
          </Stack>
        </Card>
      </div>

      {message ? <Alert severity="success">{message}</Alert> : null}
    </Stack>
  );
};
