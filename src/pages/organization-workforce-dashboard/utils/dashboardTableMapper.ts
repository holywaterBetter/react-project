import { type OrganizationCategoryCode } from '@constants/organizationCategoryMap';
import type {
  DashboardPeriodKey,
  DashboardTableCell,
  DashboardTableRow,
  DashboardTableSection,
  OrganizationWorkforceDashboardEntry
} from '@pages/organization-workforce-dashboard/types/organizationWorkforceDashboard';

const rowDefinitions: Array<{
  id: string;
  label: string;
  level: number;
  tone: DashboardTableRow['tone'];
  categoryCodes: OrganizationCategoryCode[];
}> = [
  { id: 'total', label: '계', level: 0, tone: 'total', categoryCodes: ['A1', 'B1', 'B2', 'B3', 'C1'] },
  { id: 'a', label: '전출부서(A)', level: 0, tone: 'summary', categoryCodes: ['A1'] },
  { id: 'bc', label: '전입부서(B+C)', level: 0, tone: 'summary', categoryCodes: ['B1', 'B2', 'B3', 'C1'] },
  { id: 'b', label: 'B', level: 1, tone: 'group', categoryCodes: ['B1', 'B2', 'B3'] },
  { id: 'b3', label: '신사업', level: 2, tone: 'detail', categoryCodes: ['B3'] },
  { id: 'b2', label: '성장사업', level: 2, tone: 'detail', categoryCodes: ['B2'] },
  { id: 'b1', label: 'AX', level: 2, tone: 'detail', categoryCodes: ['B1'] },
  { id: 'c', label: 'C', level: 1, tone: 'group', categoryCodes: ['C1'] },
  { id: 'c1', label: '업무로드高', level: 2, tone: 'detail', categoryCodes: ['C1'] }
];

const sumMetric = (
  entry: OrganizationWorkforceDashboardEntry,
  categoryCodes: OrganizationCategoryCode[],
  periodKey: DashboardPeriodKey
) =>
  categoryCodes.reduce(
    (accumulator, categoryCode) => ({
      headcount: accumulator.headcount + entry.categoryMetrics[categoryCode][periodKey].headcount,
      reallocated: accumulator.reallocated + entry.categoryMetrics[categoryCode][periodKey].reallocated
    }),
    { headcount: 0, reallocated: 0 }
  );

export const calculateRatios = (value: number, total: number) => {
  if (total <= 0) {
    return 0;
  }

  return (value / total) * 100;
};

export const calculateDeltas = (baseline: number, target: number) => target - baseline;

const buildTableCell = (current: { headcount: number; reallocated: number }, total: number, delta?: number | null): DashboardTableCell => ({
  headcount: current.headcount,
  ratio: calculateRatios(current.headcount, total),
  delta,
  reallocated: current.reallocated
});

export const mapOrganizationDashboardToTableRows = (entry: OrganizationWorkforceDashboardEntry): DashboardTableRow[] => {
  const actualTotal = sumMetric(entry, ['A1', 'B1', 'B2', 'B3', 'C1'], 'actual2025').headcount;
  const targetTotal = sumMetric(entry, ['A1', 'B1', 'B2', 'B3', 'C1'], 'target2026').headcount;
  const currentTotal = sumMetric(entry, ['A1', 'B1', 'B2', 'B3', 'C1'], 'current202604').headcount;

  return rowDefinitions.map((definition) => {
    const actual = sumMetric(entry, definition.categoryCodes, 'actual2025');
    const target = sumMetric(entry, definition.categoryCodes, 'target2026');
    const current = sumMetric(entry, definition.categoryCodes, 'current202604');

    return {
      id: `${entry.orgCode}-${definition.id}`,
      label: definition.label,
      level: definition.level,
      tone: definition.tone,
      actual2025: buildTableCell(actual, actualTotal, null),
      target2026: buildTableCell(target, targetTotal, calculateDeltas(actual.headcount, target.headcount)),
      current202604: buildTableCell(current, currentTotal, calculateDeltas(actual.headcount, current.headcount))
    };
  });
};

export const buildOrganizationSections = (entries: OrganizationWorkforceDashboardEntry[]): DashboardTableSection[] =>
  entries.map((entry) => ({
    orgCode: entry.orgCode,
    orgName: entry.orgName,
    orgDisplayName: entry.orgDisplayName,
    lastUpdated: entry.lastUpdated,
    sourceRecordCount: entry.sourceRecordCount,
    rows: mapOrganizationDashboardToTableRows(entry)
  }));
