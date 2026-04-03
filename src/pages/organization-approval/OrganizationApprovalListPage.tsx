import { useDevUserMode } from '@features/auth/context/DevUserModeContext';
import { useAppTranslation } from '@hooks/useAppTranslation';
import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
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
import { Link as RouterLink } from 'react-router-dom';

export const OrganizationApprovalListPage = () => {
  const { activeUser } = useDevUserMode();
  const { t } = useAppTranslation();
  useWorkforceRepositoryVersion();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [keyword, setKeyword] = useState('');
  const requests = approvalService.listRequests(activeUser);

  const filteredRequests = useMemo(() => {
    const loweredKeyword = keyword.trim().toLowerCase();

    return [...requests]
      .filter((request) => (statusFilter === 'all' ? true : request.status === statusFilter))
      .filter((request) => {
        if (!loweredKeyword) {
          return true;
        }

        return [request.divisionName, request.submittedByLabel, request.id].some((value) =>
          value.toLowerCase().includes(loweredKeyword)
        );
      })
      .sort((left, right) => {
        if (left.status === right.status) {
          return right.submittedAt.localeCompare(left.submittedAt);
        }

        if (left.status === 'pending') {
          return -1;
        }

        if (right.status === 'pending') {
          return 1;
        }

        return right.submittedAt.localeCompare(left.submittedAt);
      });
  }, [keyword, requests, statusFilter]);

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" className="rounded-[var(--radius-xl)] border border-line bg-surface p-6 shadow-sm">
        <Stack spacing={1.5}>
          <Typography variant="overline" color="text.secondary" fontWeight={700}>
            {t('approval.list.overline')}
          </Typography>
          <Typography variant="h4" fontWeight={800}>
            {t('approval.list.title')}
          </Typography>
          <Typography color="text.secondary">
            {t('approval.list.description')}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip size="small" label={t('approval.list.activeUser', { name: activeUser.name, role: activeUser.role })} />
            <Chip
              size="small"
              variant="outlined"
              label={t('approval.list.pendingCount', {
                count: requests.filter((request) => request.status === 'pending').length.toLocaleString()
              })}
            />
          </Stack>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          fullWidth
          value={keyword}
          label={t('approval.list.searchLabel')}
          placeholder={t('approval.list.searchPlaceholder')}
          onChange={(event) => {
            setKeyword(event.target.value);
          }}
        />
        <TextField
          select
          label={t('approval.list.statusLabel')}
          value={statusFilter}
          sx={{ minWidth: 180 }}
          onChange={(event) => {
            setStatusFilter(event.target.value as typeof statusFilter);
          }}
        >
          <MenuItem value="all">{t('approval.list.allStatuses')}</MenuItem>
          <MenuItem value="pending">{t('common.status.pending')}</MenuItem>
          <MenuItem value="approved">{t('common.status.approved')}</MenuItem>
          <MenuItem value="rejected">{t('common.status.rejected')}</MenuItem>
        </TextField>
      </Stack>

      {filteredRequests.length === 0 ? (
        <Alert severity="info">{t('approval.list.empty')}</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('approval.list.table.status')}</TableCell>
                <TableCell>{t('approval.list.table.division')}</TableCell>
                <TableCell>{t('approval.list.table.requester')}</TableCell>
                <TableCell>{t('approval.list.table.changedRows')}</TableCell>
                <TableCell>{t('approval.list.table.submittedAt')}</TableCell>
                <TableCell align="right">{t('approval.list.table.action')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>
                    <Chip
                      size="small"
                      color={
                        request.status === 'approved'
                          ? 'success'
                          : request.status === 'rejected'
                            ? 'error'
                            : 'warning'
                      }
                      label={t(`common.status.${request.status}`)}
                    />
                  </TableCell>
                  <TableCell>{request.divisionName}</TableCell>
                  <TableCell>{request.submittedByLabel}</TableCell>
                  <TableCell>{request.totalChangedRows.toLocaleString()}</TableCell>
                  <TableCell>{new Date(request.submittedAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Button component={RouterLink} to={`/organization/approval/${request.id}`} size="small" variant="outlined">
                      {t('common.actions.viewDetail')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
};
