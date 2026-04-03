import styled from '@emotion/styled';
import { Box, Button, Card, Chip, Stack, Typography } from '@mui/material';

type DemoStatusCardProps = {
  title: string;
  description: string;
  onAction: () => void;
};

const AccentBadge = styled.span`
  background: linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700));
  color: var(--color-fg-inverse);
  border-radius: var(--radius-full);
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
`;

export const DemoStatusCard = ({ title, description, onAction }: DemoStatusCardProps) => (
  <Card className="rounded-xl border border-line bg-surface p-6 shadow-sm">
    <Stack spacing={3}>
      <div className="flex items-center gap-2">
        <AccentBadge>Theme Token</AccentBadge>
        <Typography variant="h6">{title}</Typography>
      </div>
      <Typography className="text-ink-muted">{description}</Typography>
      <Box className="flex flex-wrap gap-2">
        <Chip label="MUI Card" color="primary" variant="outlined" />
        <Chip label="Tailwind Layout" color="default" variant="outlined" />
        <Chip label="CSS Variables" color="success" variant="outlined" />
      </Box>
      <Button variant="contained" onClick={onAction} sx={{ alignSelf: 'flex-start' }}>
        Trigger Action
      </Button>
    </Stack>
  </Card>
);
