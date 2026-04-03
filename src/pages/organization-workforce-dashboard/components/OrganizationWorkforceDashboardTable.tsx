import { useAppTranslation } from '@hooks/useAppTranslation';
import { Alert, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { OrganizationWorkforceDashboardSection } from '@pages/organization-workforce-dashboard/components/OrganizationWorkforceDashboardSection';
import type { DashboardTableSection } from '@pages/organization-workforce-dashboard/types/organizationWorkforceDashboard';

type OrganizationWorkforceDashboardTableProps = {
  sections: DashboardTableSection[];
  isLoading: boolean;
  isEmpty: boolean;
};

const LoadingRows = () => (
  <>
    {Array.from({ length: 12 }).map((_, index) => (
      <TableRow key={`loading-row-${index}`}>
        {Array.from({ length: 13 }).map((__, cellIndex) => (
          <TableCell key={`loading-cell-${index}-${cellIndex}`}>
            <Skeleton animation="wave" height={20} />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

export const OrganizationWorkforceDashboardTable = ({
  sections,
  isLoading,
  isEmpty
}: OrganizationWorkforceDashboardTableProps) => {
  const { t } = useAppTranslation();

  if (isEmpty) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-dashed border-line-strong bg-surface px-6 py-10 text-center">
        <Stack spacing={1}>
          <Typography variant="h6">{t('workforceDashboard.table.emptyTitle')}</Typography>
          <Typography variant="body2" className="text-ink-muted">
            {t('workforceDashboard.table.emptyDescription')}
          </Typography>
        </Stack>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-xl)] border border-line bg-surface shadow-sm">
      <TableContainer sx={{ maxHeight: '70vh' }}>
        <Table size="small" stickyHeader sx={{ minWidth: 1500 }}>
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2} sx={{ minWidth: 140, backgroundColor: 'var(--color-bg-raised)' }}>
                {t('workforceDashboard.table.headers.organization')}
              </TableCell>
              <TableCell rowSpan={2} sx={{ minWidth: 200, backgroundColor: 'var(--color-bg-raised)' }}>
                {t('workforceDashboard.table.headers.classification')}
              </TableCell>
              <TableCell colSpan={3} align="center" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                {t('workforceDashboard.table.headers.actual2025')}
              </TableCell>
              <TableCell colSpan={4} align="center" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                {t('workforceDashboard.table.headers.target2026')}
              </TableCell>
              <TableCell colSpan={4} align="center" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                {t('workforceDashboard.table.headers.current202604')}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                {t('workforceDashboard.table.headers.headcount')}
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                {t('workforceDashboard.table.headers.ratio')}
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                {t('workforceDashboard.table.headers.reallocated')}
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                {t('workforceDashboard.table.headers.headcount')}
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                {t('workforceDashboard.table.headers.ratio')}
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                {t('workforceDashboard.table.headers.delta')}
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                {t('workforceDashboard.table.headers.reallocated')}
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                {t('workforceDashboard.table.headers.headcount')}
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                {t('workforceDashboard.table.headers.ratio')}
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                {t('workforceDashboard.table.headers.delta')}
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                {t('workforceDashboard.table.headers.reallocated')}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? <LoadingRows /> : null}
            {!isLoading
              ? sections.map((section) => <OrganizationWorkforceDashboardSection key={section.orgCode} section={section} />)
              : null}
          </TableBody>
        </Table>
      </TableContainer>

      <div className="border-t border-line px-5 py-3">
        <Alert severity="info" variant="outlined">
          {t('workforceDashboard.table.info')}
        </Alert>
      </div>
    </div>
  );
};
