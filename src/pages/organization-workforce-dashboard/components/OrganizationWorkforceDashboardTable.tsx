import { useAppTranslation } from '@hooks/useAppTranslation';
import {
  Alert,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { OrganizationWorkforceDashboardSection } from '@pages/organization-workforce-dashboard/components/OrganizationWorkforceDashboardSection';
import type { DashboardTableSection } from '@pages/organization-workforce-dashboard/types/organizationWorkforceDashboard';

type PeriodLabels = {
  actual2025?: string;
  target2026?: string;
  current202604?: string;
};

type OrganizationWorkforceDashboardTableProps = {
  sections: DashboardTableSection[];
  isLoading: boolean;
  isEmpty: boolean;
  periodLabels?: PeriodLabels;
};

const GROUP_DIVIDER = '3px solid var(--color-border-strong)';
const STICKY_HEADER_TOP = 0;
const GROUP_HEADER_HEIGHT = 44;
const STICKY_SUBHEADER_TOP = GROUP_HEADER_HEIGHT;

const GROUP_HEADER_CELL_SX = {
  backgroundColor: 'var(--color-bg-raised)',
  py: 1,
  lineHeight: 1.2,
  verticalAlign: 'bottom'
};

const GROUP_SUBHEADER_CELL_SX = {
  backgroundColor: 'var(--color-bg-raised)',
  py: 1,
  lineHeight: 1.2
};

const PERIOD_GROUPS: Array<{
  key: keyof PeriodLabels;
  fallbackKey: string;
  colSpan: number;
  subHeaders: string[];
}> = [
  {
    key: 'actual2025',
    fallbackKey: 'workforceDashboard.table.headers.actual2025',
    colSpan: 3,
    subHeaders: ['headcount', 'ratio', 'reallocated']
  },
  {
    key: 'target2026',
    fallbackKey: 'workforceDashboard.table.headers.target2026',
    colSpan: 4,
    subHeaders: ['headcount', 'ratio', 'delta', 'reallocated']
  },
  {
    key: 'current202604',
    fallbackKey: 'workforceDashboard.table.headers.current202604',
    colSpan: 4,
    subHeaders: ['headcount', 'ratio', 'delta', 'reallocated']
  }
];

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
  isEmpty,
  periodLabels
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
          <TableHead
            sx={{
              '& .MuiTableCell-stickyHeader': {
                backgroundColor: 'var(--color-bg-raised)'
              },
              '& tr:first-of-type': {
                height: GROUP_HEADER_HEIGHT
              },
              '& tr:first-of-type .MuiTableCell-stickyHeader': {
                top: STICKY_HEADER_TOP,
                zIndex: 6
              },
              '& tr:nth-of-type(2) .MuiTableCell-stickyHeader': {
                top: STICKY_SUBHEADER_TOP,
                zIndex: 5
              }
            }}
          >
            <TableRow>
              <TableCell
                rowSpan={2}
                sx={{ minWidth: 140, backgroundColor: 'var(--color-bg-raised)', zIndex: 5, py: 1.5 }}
              >
                {t('workforceDashboard.table.headers.organization')}
              </TableCell>
              <TableCell
                rowSpan={2}
                sx={{ minWidth: 200, backgroundColor: 'var(--color-bg-raised)', zIndex: 5, py: 1.5 }}
              >
                {t('workforceDashboard.table.headers.classification')}
              </TableCell>

              {PERIOD_GROUPS.map((group, index) => (
                <TableCell
                  key={group.key}
                  colSpan={group.colSpan}
                  align="center"
                  sx={{
                    ...GROUP_HEADER_CELL_SX,
                    borderLeft: GROUP_DIVIDER,
                    borderRight: index === PERIOD_GROUPS.length - 1 ? GROUP_DIVIDER : undefined,
                    zIndex: 5
                  }}
                >
                  <Typography component="span" variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {periodLabels?.[group.key] ?? t(group.fallbackKey)}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>

            <TableRow>
              {PERIOD_GROUPS.flatMap((group, groupIndex) =>
                group.subHeaders.map((subHeader, subIndex) => (
                  <TableCell
                    key={`${group.key}-${subHeader}`}
                    align="right"
                    sx={{
                      ...GROUP_SUBHEADER_CELL_SX,
                      fontWeight: subIndex === 0 ? 700 : 600,
                      borderLeft: subIndex === 0 ? GROUP_DIVIDER : undefined,
                      borderRight:
                        groupIndex === PERIOD_GROUPS.length - 1 && subIndex === group.subHeaders.length - 1
                          ? GROUP_DIVIDER
                          : undefined,
                      zIndex: 5
                    }}
                  >
                    {t(`workforceDashboard.table.headers.${subHeader}`)}
                  </TableCell>
                ))
              )}
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
