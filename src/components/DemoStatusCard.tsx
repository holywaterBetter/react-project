import styled from '@emotion/styled';
import { Button, Paper, Typography } from '@mui/material';

type DemoStatusCardProps = {
  title: string;
  description: string;
  onAction: () => void;
};

const AccentBadge = styled.span`
  background: linear-gradient(90deg, #2563eb, #7c3aed);
  color: white;
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
`;

export const DemoStatusCard = ({ title, description, onAction }: DemoStatusCardProps) => (
  <Paper className="space-y-4 rounded-xl border border-slate-200 p-6 shadow-sm">
    <div className="flex items-center gap-2">
      <AccentBadge>Emotion</AccentBadge>
      <Typography variant="h6">{title}</Typography>
    </div>
    <Typography className="text-slate-600">{description}</Typography>
    <Button variant="contained" onClick={onAction}>
      Trigger Action
    </Button>
  </Paper>
);
