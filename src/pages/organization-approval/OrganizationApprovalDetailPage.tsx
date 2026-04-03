import { useDevUserMode } from '@features/auth/context/DevUserModeContext';
import { canApproveChanges } from '@features/auth/types/devUserMode';
import {
  Alert,
  Button,
  Chip,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { approvalService } from '@services/approvalService';
import { useWorkforceRepositoryVersion } from '@services/workforceRepository';
import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

const fieldLabels: Record<string, string> = {
  updated_date: 'Base Month',
  org_division_name: 'Division',
  org_name: 'Organization Name',
  org_category_code: 'Category Code',
  org_category_name: 'Category'
};

const changedRowSx = {
  backgroundColor: 'rgba(59, 130, 246, 0.08)'
};

export const OrganizationApprovalDetailPage = () => {
  const { activeUser } = useDevUserMode();
  useWorkforceRepositoryVersion();
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const [decisionNote, setDecisionNote] = useState('');
  const [hideUnchanged, setHideUnchanged] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const request = approvalService.getRequest(activeUser, id);

  const visibleRows = useMemo(() => {
    if (!request) {
      return [];
    }

    return request.changedRows.filter((row) => (hideUnchanged ? row.changedFields.length > 0 : true));
  }, [hideUnchanged, request]);

  if (!request) {
    return <Alert severity="warning">Approval request was not found or is not visible for the current user.</Alert>;
  }

  const handleDecision = async (decision: 'approve' | 'reject') => {
    try {
      setError(null);

      if (decision === 'approve') {
        approvalService.approveRequest(activeUser, request.id, decisionNote.trim());
      } else {
        approvalService.rejectRequest(activeUser, request.id, decisionNote.trim());
      }

      navigate('/organization/approval');
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'Failed to apply approval decision.');
    }
  };

  return (
    <Stack spacing={3}>
      <Button component={RouterLink} to="/organization/approval" variant="text" sx={{ alignSelf: 'flex-start' }}>
        Back to approvals
      </Button>

      <Paper variant="outlined" className="rounded-[var(--radius-xl)] border border-line bg-surface p-6 shadow-sm">
        <Stack spacing={1.25}>
          <Typography variant="overline" color="text.secondary" fontWeight={700}>
            Approval Detail
          </Typography>
          <Typography variant="h4" fontWeight={800}>
            {request.divisionName} Change Request
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={request.status.toUpperCase()} color={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'error' : 'warning'} />
            <Chip variant="outlined" label={`Requester: ${request.submittedByLabel}`} />
            <Chip variant="outlined" label={`Rows: ${request.totalChangedRows}`} />
          </Stack>
          <Typography color="text.secondary">
            Submitted {new Date(request.submittedAt).toLocaleString()}
            {request.decision ? ` · Decided ${new Date(request.decision.decidedAt).toLocaleString()}` : ''}
          </Typography>
          {request.decision?.note ? <Alert severity="info">Decision note: {request.decision.note}</Alert> : null}
        </Stack>
      </Paper>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <FormControlLabel
          control={<Switch checked={hideUnchanged} onChange={(event) => setHideUnchanged(event.target.checked)} />}
          label="Hide unchanged rows"
        />
        {request.status === 'pending' && canApproveChanges(activeUser) ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              size="small"
              label="Decision note"
              value={decisionNote}
              onChange={(event) => {
                setDecisionNote(event.target.value);
              }}
              sx={{ minWidth: 260 }}
            />
            <Button color="success" variant="contained" onClick={() => void handleDecision('approve')}>
              Approve
            </Button>
            <Button color="error" variant="outlined" onClick={() => void handleDecision('reject')}>
              Reject
            </Button>
          </Stack>
        ) : null}
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Organization</TableCell>
              <TableCell>Field</TableCell>
              <TableCell>Before</TableCell>
              <TableCell>After</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.flatMap((row) =>
              row.changedFields.map((change) => (
                <TableRow key={`${row.orgCode}-${change.field}`} sx={changedRowSx}>
                  <TableCell>
                    <Stack spacing={0.3}>
                      <Typography variant="body2" fontWeight={700}>
                        {row.orgName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.orgCode}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{fieldLabels[change.field] ?? change.field}</TableCell>
                  <TableCell>{change.before || '-'}</TableCell>
                  <TableCell>{change.after || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
