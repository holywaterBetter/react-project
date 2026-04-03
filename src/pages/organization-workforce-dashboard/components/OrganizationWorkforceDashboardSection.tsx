import type { DashboardTableSection } from '@pages/organization-workforce-dashboard/types/organizationWorkforceDashboard';
import {
  formatDateLabel,
  formatHeadcount,
  formatPercent,
  formatSignedHeadcount
} from '@pages/organization-workforce-dashboard/utils/dashboardFormatters';
import { TableCell, TableRow, Typography } from '@mui/material';

type OrganizationWorkforceDashboardSectionProps = {
  section: DashboardTableSection;
};

const getRowBackground = (tone: DashboardTableSection['rows'][number]['tone']) => {
  if (tone === 'total') {
    return 'color-mix(in srgb, var(--color-brand-50) 72%, var(--color-bg-surface) 28%)';
  }

  if (tone === 'group') {
    return 'color-mix(in srgb, var(--color-gray-100) 70%, var(--color-bg-surface) 30%)';
  }

  if (tone === 'summary') {
    return 'color-mix(in srgb, var(--color-gray-50) 80%, var(--color-bg-surface) 20%)';
  }

  return 'var(--color-bg-surface)';
};

const getDeltaColor = (value?: number | null) => {
  if (!value) {
    return 'text.primary';
  }

  return value > 0 ? 'error.main' : 'success.main';
};

export const OrganizationWorkforceDashboardSection = ({ section }: OrganizationWorkforceDashboardSectionProps) => (
  <>
    {section.rows.map((row, index) => (
      <TableRow
        key={row.id}
        hover={false}
        sx={{
          backgroundColor: getRowBackground(row.tone),
          '& td': {
            borderBottomColor: 'var(--color-border-default)'
          },
          '&:first-of-type td': {
            borderTop: '2px solid var(--color-border-strong)'
          }
        }}
      >
        {index === 0 ? (
          <TableCell
            rowSpan={section.rows.length}
            sx={{
              minWidth: 140,
              verticalAlign: 'top',
              backgroundColor: 'var(--color-bg-raised)',
              borderRight: '1px solid var(--color-border-default)'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {section.orgDisplayName}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {section.orgCode}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              기준조직 {section.sourceRecordCount.toLocaleString('ko-KR')}개
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              갱신 {formatDateLabel(section.lastUpdated)}
            </Typography>
          </TableCell>
        ) : null}

        <TableCell
          sx={{
            minWidth: 200,
            pl: `${16 + row.level * 18}px`,
            fontWeight: row.tone === 'detail' ? 500 : 700,
            whiteSpace: 'nowrap'
          }}
        >
          {row.label}
        </TableCell>

        <TableCell align="right">{formatHeadcount(row.actual2025.headcount)}</TableCell>
        <TableCell align="right">{formatPercent(row.actual2025.ratio)}</TableCell>
        <TableCell align="right">{formatHeadcount(row.actual2025.reallocated)}</TableCell>

        <TableCell align="right">{formatHeadcount(row.target2026.headcount)}</TableCell>
        <TableCell align="right">{formatPercent(row.target2026.ratio)}</TableCell>
        <TableCell align="right" sx={{ color: getDeltaColor(row.target2026.delta), fontWeight: 600 }}>
          {formatSignedHeadcount(row.target2026.delta)}
        </TableCell>
        <TableCell align="right">{formatHeadcount(row.target2026.reallocated)}</TableCell>

        <TableCell align="right">{formatHeadcount(row.current202604.headcount)}</TableCell>
        <TableCell align="right">{formatPercent(row.current202604.ratio)}</TableCell>
        <TableCell align="right" sx={{ color: getDeltaColor(row.current202604.delta), fontWeight: 600 }}>
          {formatSignedHeadcount(row.current202604.delta)}
        </TableCell>
        <TableCell align="right">{formatHeadcount(row.current202604.reallocated)}</TableCell>
      </TableRow>
    ))}
  </>
);
