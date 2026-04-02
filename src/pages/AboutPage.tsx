
import { env } from '@constants/env';
import { useAppTranslation } from '@hooks/useAppTranslation';
import { List, ListItem, ListItemText, Typography } from '@mui/material';

export const AboutPage = () => {
  const { t } = useAppTranslation();

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {t('about.title')}
      </Typography>
      <Typography>{t('about.description')}</Typography>
      <List>
        <ListItem>
          <ListItemText primary={`APP_NAME: ${env.appName}`} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`API_BASE_URL: ${env.apiBaseUrl}`} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`APP_BASE_PATH: ${env.appBasePath}`} />
        </ListItem>
      </List>
    </>
  );
};
