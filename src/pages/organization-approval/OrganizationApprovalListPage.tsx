import { useDevUserMode } from '@features/auth/context/DevUserModeContext';
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
            Approval Workflow
          </Typography>
          <Typography variant="h4" fontWeight={800}>
            Pending Changes
          </Typography>
          <Typography color="text.secondary">
            Review uploaded workforce changes, compare diffs, and approve or reject requests.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip size="small" label={`Active user: ${activeUser.label}`} />
            <Chip size="small" variant="outlined" label={`${requests.filter((request) => request.status === 'pending').length} pending`} />
          </Stack>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          fullWidth
          value={keyword}
          label="Search requests"
          placeholder="Search by division, requester, or request id"
          onChange={(event) => {
            setKeyword(event.target.value);
          }}
        />
        <TextField
          select
          label="Status"
          value={statusFilter}
          sx={{ minWidth: 180 }}
          onChange={(event) => {
            setStatusFilter(event.target.value as typeof statusFilter);
          }}
        >
          <MenuItem value="all">All statuses</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </TextField>
      </Stack>

      {filteredRequests.length === 0 ? (
        <Alert severity="info">No approval requests match the current filters.</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Division</TableCell>
                <TableCell>Requester</TableCell>
                <TableCell>Changed Rows</TableCell>
                <TableCell>Submitted At</TableCell>
                <TableCell align="right">Action</TableCell>
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
                      label={request.status.toUpperCase()}
                    />
                  </TableCell>
                  <TableCell>{request.divisionName}</TableCell>
                  <TableCell>{request.submittedByLabel}</TableCell>
                  <TableCell>{request.totalChangedRows.toLocaleString()}</TableCell>
                  <TableCell>{new Date(request.submittedAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Button component={RouterLink} to={`/organization/approval/${request.id}`} size="small" variant="outlined">
                      View Detail
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
