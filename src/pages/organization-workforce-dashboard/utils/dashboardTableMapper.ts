import i18n from '@app/i18n';
import { organizationCategoryMap, type OrganizationCategoryCode } from '@constants/organizationCategoryMap';
import { DIVISION_NAME_EN_BY_CODE, SMALL_DIVISION_GROUP } from '@features/auth/types/devUserMode';
import type {
  DashboardPeriodKey,
  DashboardTableCell,
  DashboardTableRow,
  DashboardTableSection,
  OrganizationWorkforceDashboardEntry
} from '@pages/organization-workforce-dashboard/types/organizationWorkforceDashboard';
import { isKoreanLanguage } from '@utils/localization';

const rowDefinitions: Array<{
  id: string;
  level: number;
  tone: DashboardTableRow['tone'];
  categoryCodes: OrganizationCategoryCode[];
}> = [
  { id: 'total', level: 0, tone: 'total', categoryCodes: ['A1', 'B1', 'B2', 'B3', 'C1'] },
  { id: 'a', level: 0, tone: 'summary', categoryCodes: ['A1'] },
  { id: 'bc', level: 0, tone: 'summary', categoryCodes: ['B1', 'B2', 'B3', 'C1'] },
  { id: 'b', level: 1, tone: 'group', categoryCodes: ['B1', 'B2', 'B3'] },
  { id: 'b3', level: 2, tone: 'detail', categoryCodes: ['B3'] },
  { id: 'b2', level: 2, tone: 'detail', categoryCodes: ['B2'] },
  { id: 'b1', level: 2, tone: 'detail', categoryCodes: ['B1'] },
  { id: 'c', level: 1, tone: 'group', categoryCodes: ['C1'] },
  { id: 'c1', level: 2, tone: 'detail', categoryCodes: ['C1'] }
];

const getLocalizedRowLabel = (rowId: string, language: string) => {
  const t = i18n.getFixedT(language, 'common');

  if (rowId === 'total') return t('workforceDashboard.rows.total');
  if (rowId === 'a') return t('workforceDashboard.rows.a');
  if (rowId === 'bc') return t('workforceDashboard.rows.bc');
  if (rowId === 'b') return t('workforceDashboard.rows.b');
  if (rowId === 'c') return t('workforceDashboard.rows.c');

  if (rowId === 'b1') {
    return isKoreanLanguage(language) ? organizationCategoryMap.B1.dashboardLabel : organizationCategoryMap.B1.displayLabel;
  }

  if (rowId === 'b2') {
    return isKoreanLanguage(language) ? organizationCategoryMap.B2.dashboardLabel : organizationCategoryMap.B2.displayLabel;
  }

  if (rowId === 'b3') {
    return isKoreanLanguage(language) ? organizationCategoryMap.B3.dashboardLabel : organizationCategoryMap.B3.displayLabel;
  }

  if (rowId === 'c1') {
    return isKoreanLanguage(language) ? organizationCategoryMap.C1.dashboardLabel : organizationCategoryMap.C1.displayLabel;
  }

  return rowId;
};

const localizeOrgDisplayName = (orgCode: string, orgDisplayName: string, language: string) => {
  const t = i18n.getFixedT(language, 'common');

  if (orgCode === 'ALL') {
    return t('workforceDashboard.filters.allDivisions');
  }

  if (isKoreanLanguage(language)) {
    return orgDisplayName;
  }

  if (orgCode === SMALL_DIVISION_GROUP.code) {
    return SMALL_DIVISION_GROUP.nameEn;
  }

  return DIVISION_NAME_EN_BY_CODE.get(orgCode) ?? orgDisplayName;
};

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

export const mapOrganizationDashboardToTableRows = (
  entry: OrganizationWorkforceDashboardEntry,
  language = i18n.language
): DashboardTableRow[] => {
  const actualTotal = sumMetric(entry, ['A1', 'B1', 'B2', 'B3', 'C1'], 'actual2025').headcount;
  const targetTotal = sumMetric(entry, ['A1', 'B1', 'B2', 'B3', 'C1'], 'target2026').headcount;
  const currentTotal = sumMetric(entry, ['A1', 'B1', 'B2', 'B3', 'C1'], 'current202604').headcount;

  return rowDefinitions.map((definition) => {
    const actual = sumMetric(entry, definition.categoryCodes, 'actual2025');
    const target = sumMetric(entry, definition.categoryCodes, 'target2026');
    const current = sumMetric(entry, definition.categoryCodes, 'current202604');

    return {
      id: `${entry.orgCode}-${definition.id}`,
      label: getLocalizedRowLabel(definition.id, language),
      level: definition.level,
      tone: definition.tone,
      actual2025: buildTableCell(actual, actualTotal, null),
      target2026: buildTableCell(target, targetTotal, calculateDeltas(actual.headcount, target.headcount)),
      current202604: buildTableCell(current, currentTotal, calculateDeltas(actual.headcount, current.headcount))
    };
  });
};

export const buildOrganizationSections = (
  entries: OrganizationWorkforceDashboardEntry[],
  language = i18n.language
): DashboardTableSection[] =>
  entries.map((entry) => ({
    orgCode: entry.orgCode,
    orgName: entry.orgName,
    orgDisplayName: localizeOrgDisplayName(entry.orgCode, entry.orgDisplayName, language),
    lastUpdated: entry.lastUpdated,
    sourceRecordCount: entry.sourceRecordCount,
    rows: mapOrganizationDashboardToTableRows(entry, language)
  }));
