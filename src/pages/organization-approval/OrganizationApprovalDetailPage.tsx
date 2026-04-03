import { useDevUserMode } from '@features/auth/context/DevUserModeContext';
import { canApproveChanges } from '@features/auth/types/devUserMode';
import { useAppTranslation } from '@hooks/useAppTranslation';
import {
  Alert,
  Box,
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
import type { OrganizationRecord } from '@shared-types/org';
import { useMemo, useState, type ReactNode } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

const formatYearMonth = (value: string) => (value.length === 8 ? `${value.slice(0, 4)}.${value.slice(4, 6)}` : value);

const DiffCell = ({
  before,
  after,
  renderValue
}: {
  before: string;
  after: string;
  renderValue?: (value: string) => ReactNode;
}) => {
  const isChanged = before !== after;

  if (!isChanged) {
    return <>{renderValue ? renderValue(after) : after || '-'}</>;
  }

  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ fontWeight: 700, color: 'primary.main' }}>
      <Box>{renderValue ? renderValue(before) : before || '-'}</Box>
      <Typography variant="caption">→</Typography>
      <Box>{renderValue ? renderValue(after) : after || '-'}</Box>
    </Stack>
  );
};

const rowChanged = (before: OrganizationRecord, after: OrganizationRecord) =>
  before.updated_date !== after.updated_date ||
  before.org_division_name !== after.org_division_name ||
  before.org_department_name !== after.org_department_name ||
  before.org_category_name !== after.org_category_name;

export const OrganizationApprovalDetailPage = () => {
  const { t } = useAppTranslation();
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

    return request.changedRows.filter((row) => (hideUnchanged ? rowChanged(row.before, row.after) : true));
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
        {t('approval.back')}
      </Button>

      <Paper variant="outlined" className="rounded-[var(--radius-xl)] border border-line bg-surface p-6 shadow-sm">
        <Stack spacing={1.25}>
          <Typography variant="overline" color="text.secondary" fontWeight={700}>
            {t('approval.detail.title')}
          </Typography>
          <Typography variant="h4" fontWeight={800}>
            {request.divisionName} {t('approval.detail.requestSuffix')}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={request.status.toUpperCase()} color={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'error' : 'warning'} />
            <Chip variant="outlined" label={`${t('approval.requester')}: ${request.submittedByLabel}`} />
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
          label={t('approval.hideUnchanged')}
        />
        {request.status === 'pending' && canApproveChanges(activeUser) ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              size="small"
              label={t('approval.decisionNote')}
              value={decisionNote}
              onChange={(event) => {
                setDecisionNote(event.target.value);
              }}
              sx={{ minWidth: 260 }}
            />
            <Button color="success" variant="contained" onClick={() => void handleDecision('approve')}>
              {t('approval.approve')}
            </Button>
            <Button color="error" variant="outlined" onClick={() => void handleDecision('reject')}>
              {t('approval.reject')}
            </Button>
          </Stack>
        ) : null}
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('organization.table.headers.updatedDate')}</TableCell>
              <TableCell>{t('organization.table.headers.division')}</TableCell>
              <TableCell>{t('organization.table.headers.department')}</TableCell>
              <TableCell>{t('organization.table.headers.category')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>{t('approval.noChangedRows')}</TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row) => {
                const changed = rowChanged(row.before, row.after);

                return (
                  <TableRow key={row.orgCode} sx={changed ? { backgroundColor: 'rgba(59, 130, 246, 0.08)' } : undefined}>
                    <TableCell>
                      <DiffCell before={formatYearMonth(row.before.updated_date)} after={formatYearMonth(row.after.updated_date)} />
                    </TableCell>
                    <TableCell>
                      <DiffCell before={row.before.org_division_name} after={row.after.org_division_name} />
                    </TableCell>
                    <TableCell>
                      <DiffCell before={row.before.org_department_name} after={row.after.org_department_name} />
                    </TableCell>
                    <TableCell>
                      <DiffCell
                        before={row.before.org_category_name}
                        after={row.after.org_category_name}
                        renderValue={(value) => <Chip size="small" variant="outlined" label={value || '-'} />}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
