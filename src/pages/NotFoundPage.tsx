import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const NotFoundPage = () => (
  <Stack spacing={2}>
    <Typography variant="h3">404</Typography>
    <Typography>Page not found.</Typography>
    <Button variant="contained" component={RouterLink} to="/">
      Go Home
    </Button>
  </Stack>
);
