import { organizationCategoryMap, organizationCategoryCodes } from '@constants/organizationCategoryMap';
import type {
  InsightCategoryDistribution,
  InsightDivisionComposition,
  InsightKpi,
  InsightStackedBarItem,
  InsightTrendPoint,
  WorkforceInsightData
} from '@features/dashboard/types/workforceInsight';
import type { OrganizationWorkforceDashboardEntry, OrganizationWorkforceDashboardMeta } from '@pages/organization-workforce-dashboard/types/organizationWorkforceDashboard';

const sumForPeriod = (entry: OrganizationWorkforceDashboardEntry, period: 'actual2025' | 'current202604' | 'target2026') =>
  organizationCategoryCodes.reduce(
    (accumulator, categoryCode) => ({
      headcount: accumulator.headcount + entry.categoryMetrics[categoryCode][period].headcount,
      reallocated: accumulator.reallocated + entry.categoryMetrics[categoryCode][period].reallocated
    }),
    { headcount: 0, reallocated: 0 }
  );

const buildKpis = (entry: OrganizationWorkforceDashboardEntry): InsightKpi[] => {
  const actual = sumForPeriod(entry, 'actual2025');
  const current = sumForPeriod(entry, 'current202604');
  const target = sumForPeriod(entry, 'target2026');
  const targetAchievement = target.headcount > 0 ? (current.headcount / target.headcount) * 100 : 0;

  return [
    {
      id: 'hc-current',
      label: 'Current Headcount',
      value: current.headcount,
      delta: current.headcount - actual.headcount,
      format: 'number'
    },
    {
      id: 'hc-target-gap',
      label: 'Target Gap',
      value: target.headcount - current.headcount,
      delta: target.headcount - actual.headcount,
      format: 'number'
    },
    {
      id: 'target-achievement',
      label: 'Target Achievement',
      value: targetAchievement,
      suffix: '%',
      delta: targetAchievement - 100,
      format: 'percent'
    },
    {
      id: 'reallocated',
      label: 'Reallocation Movements',
      value: current.reallocated,
      delta: current.reallocated - actual.reallocated,
      format: 'number'
    }
  ];
};

const monthShift = (baseMonth: string, offset: number) => {
  const [yearText, monthText] = baseMonth.split('.');
  const year = Number(yearText);
  const month = Number(monthText);

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return baseMonth;
  }

  const date = new Date(year, month - 1 + offset, 1);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const buildTrend = (entry: OrganizationWorkforceDashboardEntry, baseMonth: string): InsightTrendPoint[] => {
  const actual = sumForPeriod(entry, 'actual2025').headcount;
  const current = sumForPeriod(entry, 'current202604').headcount;
  const target = sumForPeriod(entry, 'target2026').headcount;

  const points = [-4, -3, -2, -1, 0].map((offset, index) => {
    const progress = (index + 1) / 5;
    const headcount = Math.round(actual + (current - actual) * progress);
    const projectedTarget = Math.round(actual + (target - actual) * progress);

    return {
      month: monthShift(baseMonth, offset),
      headcount,
      target: projectedTarget
    };
  });

  return points;
};

const buildDivisionComposition = (entries: OrganizationWorkforceDashboardEntry[]): InsightDivisionComposition[] =>
  entries
    .filter((entry) => entry.orgCode !== 'ALL')
    .map((entry) => {
      const actual = sumForPeriod(entry, 'actual2025');
      const current = sumForPeriod(entry, 'current202604');
      return {
        orgCode: entry.orgCode,
        orgName: entry.orgDisplayName,
        totalHeadcount: current.headcount,
        growthVsActual: current.headcount - actual.headcount,
        reallocatedRatio: current.headcount > 0 ? (current.reallocated / current.headcount) * 100 : 0
      };
    })
    .sort((left, right) => right.totalHeadcount - left.totalHeadcount);

const buildCategoryDistribution = (entry: OrganizationWorkforceDashboardEntry): InsightCategoryDistribution[] => {
  const total = sumForPeriod(entry, 'current202604').headcount;

  return organizationCategoryCodes.map((code) => {
    const headcount = entry.categoryMetrics[code].current202604.headcount;

    return {
      code,
      label: organizationCategoryMap[code].dashboardLabel,
      headcount,
      ratio: total > 0 ? (headcount / total) * 100 : 0
    };
  });
};

const buildStackedSeries = (entry: OrganizationWorkforceDashboardEntry): InsightStackedBarItem[] =>
  organizationCategoryCodes.map((code) => ({
    label: organizationCategoryMap[code].dashboardLabel,
    actual: entry.categoryMetrics[code].actual2025.headcount,
    current: entry.categoryMetrics[code].current202604.headcount,
    target: entry.categoryMetrics[code].target2026.headcount
  }));

export const mapToWorkforceInsightData = (
  entries: OrganizationWorkforceDashboardEntry[],
  meta: OrganizationWorkforceDashboardMeta,
  selectedOrgCode: string
): WorkforceInsightData => {
  const fallback = entries.find((entry) => entry.orgCode === 'ALL') ?? entries[0];
  const selectedEntry = entries.find((entry) => entry.orgCode === selectedOrgCode) ?? fallback;

  return {
    availableMonths: meta.availableSnapshotMonths,
    organizationOptions: [{ orgCode: 'ALL', orgDisplayName: 'All Divisions' }, ...meta.organizationOptions],
    selectedOrgLabel: selectedEntry.orgDisplayName,
    lastUpdated: selectedEntry.lastUpdated,
    kpis: buildKpis(selectedEntry),
    trends: buildTrend(selectedEntry, meta.baseMonth),
    divisionComposition: buildDivisionComposition(entries),
    categoryDistribution: buildCategoryDistribution(selectedEntry),
    stackedSeries: buildStackedSeries(selectedEntry)
  };
};
