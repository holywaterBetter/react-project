import { env } from '@constants/env';
import { useAppTranslation } from '@hooks/useAppTranslation';
import { Card, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';

export const AboutPage = () => {
  const { t } = useAppTranslation();

  return (
    <Card className="rounded-xl border border-line bg-surface p-6 shadow-sm">
      <Stack spacing={2}>
        <Typography variant="h4">{t('about.title')}</Typography>
        <Typography className="text-ink-muted">{t('about.description')}</Typography>
        <List disablePadding>
          <ListItem disableGutters>
            <ListItemText primary={`APP_NAME: ${env.appName}`} />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary={`API_BASE_URL: ${env.apiBaseUrl}`} />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary={`APP_BASE_PATH: ${env.appBasePath}`} />
          </ListItem>
        </List>
      </Stack>
    </Card>
  );
};
