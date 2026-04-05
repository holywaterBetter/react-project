import i18n from '@app/i18n';
import {
  organizationCategoryMap,
  organizationCategoryCodes
} from '@constants/organizationCategoryMap';
import {
  DIVISION_NAME_EN_BY_CODE,
  SMALL_DIVISION_CODES,
  SMALL_DIVISION_GROUP
} from '@features/auth/types/devUserMode';
import type {
  InsightCategoryDistribution,
  InsightCompositionByScope,
  InsightScopeMetrics,
  InsightDivisionComposition,
  InsightKpi,
  InsightMovementInfographic,
  InsightTargetProgress,
  InsightStackedBarItem,
  InsightTrendPoint,
  WorkforceInsightData
} from '@features/dashboard/types/workforceInsight';
import type {
  OrganizationWorkforceDashboardEntry,
  OrganizationWorkforceDashboardMeta
} from '@pages/organization-workforce-dashboard/types/organizationWorkforceDashboard';
import { isKoreanLanguage } from '@utils/localization';

const getTranslator = (language: string) => i18n.getFixedT(language, 'common');

const sumForPeriod = (
  entry: OrganizationWorkforceDashboardEntry,
  period: 'actual2025' | 'current202604' | 'target2026'
) =>
  organizationCategoryCodes.reduce(
    (accumulator, categoryCode) => ({
      headcount: accumulator.headcount + entry.categoryMetrics[categoryCode][period].headcount,
      reallocated: accumulator.reallocated + entry.categoryMetrics[categoryCode][period].reallocated
    }),
    { headcount: 0, reallocated: 0 }
  );

const localizeOrgDisplayName = (orgCode: string, orgDisplayName: string, language: string) => {
  const t = getTranslator(language);

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

const buildKpis = (entry: OrganizationWorkforceDashboardEntry, language: string): InsightKpi[] => {
  const t = getTranslator(language);
  const actual = sumForPeriod(entry, 'actual2025');
  const current = sumForPeriod(entry, 'current202604');
  const target = sumForPeriod(entry, 'target2026');
  const targetAchievement = target.headcount > 0 ? (current.headcount / target.headcount) * 100 : 0;

  return [
    {
      id: 'hc-current',
      label: t('insight.kpi.currentHeadcount'),
      value: current.headcount,
      delta: current.headcount - actual.headcount,
      format: 'number'
    },
    {
      id: 'hc-target-gap',
      label: t('insight.kpi.targetGap'),
      value: target.headcount - current.headcount,
      delta: target.headcount - actual.headcount,
      format: 'number'
    },
    {
      id: 'target-achievement',
      label: t('insight.kpi.targetAchievement'),
      value: targetAchievement,
      suffix: '%',
      delta: targetAchievement - 100,
      format: 'percent'
    },
    {
      id: 'reallocated',
      label: t('insight.kpi.reallocationMovements'),
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
  if (!Number.isFinite(year) || !Number.isFinite(month)) return baseMonth;
  const date = new Date(year, month - 1 + offset, 1);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const buildTrend = (
  entry: OrganizationWorkforceDashboardEntry,
  baseMonth: string
): InsightTrendPoint[] => {
  const actual = sumForPeriod(entry, 'actual2025').headcount;
  const current = sumForPeriod(entry, 'current202604').headcount;
  const target = sumForPeriod(entry, 'target2026').headcount;

  return [-4, -3, -2, -1, 0].map((offset, index) => {
    const progress = (index + 1) / 5;
    return {
      month: monthShift(baseMonth, offset),
      headcount: Math.round(actual + (current - actual) * progress),
      target: Math.round(actual + (target - actual) * progress)
    };
  });
};

const buildDivisionComposition = (
  entries: OrganizationWorkforceDashboardEntry[],
  language: string
): InsightDivisionComposition[] =>
  entries
    .filter((entry) => entry.orgCode !== 'ALL')
    .map((entry) => {
      const actual = sumForPeriod(entry, 'actual2025');
      const current = sumForPeriod(entry, 'current202604');
      return {
        orgCode: entry.orgCode,
        orgName: localizeOrgDisplayName(entry.orgCode, entry.orgDisplayName, language),
        totalHeadcount: current.headcount,
        growthVsActual: current.headcount - actual.headcount,
        reallocatedRatio:
          current.headcount > 0 ? (current.reallocated / current.headcount) * 100 : 0
      };
    })
    .sort((left, right) => right.totalHeadcount - left.totalHeadcount);

const buildCategoryDistribution = (
  entry: OrganizationWorkforceDashboardEntry,
  language: string
): InsightCategoryDistribution[] => {
  const total = sumForPeriod(entry, 'current202604').headcount;
  return organizationCategoryCodes.map((code) => {
    const headcount = entry.categoryMetrics[code].current202604.headcount;
    return {
      code,
      label: isKoreanLanguage(language)
        ? organizationCategoryMap[code].dashboardLabel
        : organizationCategoryMap[code].displayLabel,
      headcount,
      ratio: total > 0 ? (headcount / total) * 100 : 0
    };
  });
};

const buildStackedSeries = (
  entry: OrganizationWorkforceDashboardEntry,
  language: string
): InsightStackedBarItem[] =>
  organizationCategoryCodes.map((code) => ({
    label: isKoreanLanguage(language)
      ? organizationCategoryMap[code].dashboardLabel
      : organizationCategoryMap[code].displayLabel,
    actual: entry.categoryMetrics[code].actual2025.headcount,
    current: entry.categoryMetrics[code].current202604.headcount,
    target: entry.categoryMetrics[code].target2026.headcount
  }));

const buildTargetProgress = (entry: OrganizationWorkforceDashboardEntry): InsightTargetProgress => {
  const currentHeadcount = sumForPeriod(entry, 'current202604').headcount;
  const targetHeadcount = sumForPeriod(entry, 'target2026').headcount;
  const achievementRate = targetHeadcount > 0 ? (currentHeadcount / targetHeadcount) * 100 : 0;
  const gapHeadcount = targetHeadcount - currentHeadcount;

  return {
    currentHeadcount,
    targetHeadcount,
    achievementRate,
    gapHeadcount,
    isAhead: gapHeadcount <= 0
  };
};

const calculateAchievementRate = (target: number, achieved: number) =>
  target > 0 ? (achieved / target) * 100 : 0;

const aggregateEntries = (
  entries: OrganizationWorkforceDashboardEntry[],
  orgCode: string,
  orgName: string
): OrganizationWorkforceDashboardEntry => ({
  orgCode,
  orgName,
  orgDisplayName: orgName,
  sourceRecordCount: entries.reduce((sum, entry) => sum + entry.sourceRecordCount, 0),
  lastUpdated: entries[0]?.lastUpdated ?? '',
  categoryMetrics: organizationCategoryCodes.reduce(
    (accumulator, categoryCode) => {
      accumulator[categoryCode] = {
        actual2025: {
          headcount: entries.reduce(
            (sum, entry) => sum + entry.categoryMetrics[categoryCode].actual2025.headcount,
            0
          ),
          reallocated: entries.reduce(
            (sum, entry) => sum + entry.categoryMetrics[categoryCode].actual2025.reallocated,
            0
          )
        },
        current202604: {
          headcount: entries.reduce(
            (sum, entry) => sum + entry.categoryMetrics[categoryCode].current202604.headcount,
            0
          ),
          reallocated: entries.reduce(
            (sum, entry) => sum + entry.categoryMetrics[categoryCode].current202604.reallocated,
            0
          )
        },
        target2026: {
          headcount: entries.reduce(
            (sum, entry) => sum + entry.categoryMetrics[categoryCode].target2026.headcount,
            0
          ),
          reallocated: entries.reduce(
            (sum, entry) => sum + entry.categoryMetrics[categoryCode].target2026.reallocated,
            0
          )
        }
      };
      return accumulator;
    },
    {} as OrganizationWorkforceDashboardEntry['categoryMetrics']
  )
});

const buildNormalizedScopeEntries = (
  entries: OrganizationWorkforceDashboardEntry[],
  language: string
): OrganizationWorkforceDashboardEntry[] => {
  const baseEntries = entries.filter((entry) => entry.orgCode !== 'ALL');
  const smallEntries = baseEntries.filter((entry) =>
    SMALL_DIVISION_CODES.includes(entry.orgCode as (typeof SMALL_DIVISION_CODES)[number])
  );
  const largeEntries = baseEntries.filter(
    (entry) =>
      !SMALL_DIVISION_CODES.includes(entry.orgCode as (typeof SMALL_DIVISION_CODES)[number])
  );
  const localizedLargeEntries = largeEntries.map((entry) => ({
    ...entry,
    orgDisplayName: localizeOrgDisplayName(entry.orgCode, entry.orgDisplayName, language)
  }));

  if (!smallEntries.length) {
    return localizedLargeEntries;
  }

  const aggregatedSmallEntry = aggregateEntries(
    smallEntries,
    SMALL_DIVISION_GROUP.code,
    localizeOrgDisplayName(SMALL_DIVISION_GROUP.code, SMALL_DIVISION_GROUP.name, language)
  );

  return [...localizedLargeEntries, aggregatedSmallEntry];
};

const buildScopeMetrics = (
  allEntry: OrganizationWorkforceDashboardEntry,
  scopedEntries: OrganizationWorkforceDashboardEntry[]
): InsightScopeMetrics[] =>
  [allEntry, ...scopedEntries]
    .map((entry) => {
      const target = sumForPeriod(entry, 'target2026');
      const current = sumForPeriod(entry, 'current202604');

      return {
        orgCode: entry.orgCode,
        orgName: entry.orgDisplayName,
        targetHeadcount: target.headcount,
        achievedHeadcount: current.headcount,
        headcountAchievementRate: calculateAchievementRate(target.headcount, current.headcount),
        targetReallocated: target.reallocated,
        achievedReallocated: current.reallocated,
        reallocatedAchievementRate: calculateAchievementRate(
          target.reallocated,
          current.reallocated
        )
      };
    })
    .sort((left, right) => {
      if (left.orgCode === 'ALL') return -1;
      if (right.orgCode === 'ALL') return 1;
      return right.targetHeadcount - left.targetHeadcount;
    });

const buildCompositionByScope = (
  allEntry: OrganizationWorkforceDashboardEntry,
  scopedEntries: OrganizationWorkforceDashboardEntry[]
): InsightCompositionByScope[] =>
  [allEntry, ...scopedEntries]
    .map((entry) => {
      const categories = organizationCategoryCodes.map((code) => ({
        code,
        label: organizationCategoryMap[code].dashboardLabel,
        headcount: entry.categoryMetrics[code].current202604.headcount,
        ratio: 0
      }));
      const totalHeadcount = categories.reduce((sum, item) => sum + item.headcount, 0);

      return {
        orgCode: entry.orgCode,
        orgName: entry.orgDisplayName,
        totalHeadcount,
        categories: categories.map((item) => ({
          ...item,
          ratio: totalHeadcount > 0 ? (item.headcount / totalHeadcount) * 100 : 0
        }))
      };
    })
    .sort((left, right) => {
      if (left.orgCode === 'ALL') return -1;
      if (right.orgCode === 'ALL') return 1;
      return right.totalHeadcount - left.totalHeadcount;
    });

const buildMovementInfographic = (
  entries: OrganizationWorkforceDashboardEntry[],
  language: string
): InsightMovementInfographic => {
  const overallEntry = entries.find((entry) => entry.orgCode === 'ALL') ?? entries[0];
  const localizedOverallEntry = {
    ...overallEntry,
    orgDisplayName: localizeOrgDisplayName(
      overallEntry.orgCode,
      overallEntry.orgDisplayName,
      language
    )
  };
  const normalizedEntries = buildNormalizedScopeEntries(entries, language);

  return {
    scopeMetrics: buildScopeMetrics(localizedOverallEntry, normalizedEntries),
    compositionByScope: buildCompositionByScope(localizedOverallEntry, normalizedEntries)
  };
};

export const mapToWorkforceInsightData = (
  entries: OrganizationWorkforceDashboardEntry[],
  meta: OrganizationWorkforceDashboardMeta,
  selectedOrgCode: string,
  language: string
): WorkforceInsightData => {
  const fallback = entries.find((entry) => entry.orgCode === 'ALL') ?? entries[0];
  const selectedEntry = entries.find((entry) => entry.orgCode === selectedOrgCode) ?? fallback;
  const hasOverallEntry = entries.some((entry) => entry.orgCode === 'ALL');

  return {
    availableMonths: meta.availableSnapshotMonths,
    organizationOptions: hasOverallEntry
      ? [
          {
            orgCode: 'ALL',
            orgDisplayName: localizeOrgDisplayName('ALL', 'All Divisions', language)
          },
          ...meta.organizationOptions.map((option) => ({
            ...option,
            orgDisplayName: localizeOrgDisplayName(option.orgCode, option.orgDisplayName, language)
          }))
        ]
      : meta.organizationOptions.map((option) => ({
          ...option,
          orgDisplayName: localizeOrgDisplayName(option.orgCode, option.orgDisplayName, language)
        })),
    selectedOrgLabel: localizeOrgDisplayName(
      selectedEntry.orgCode,
      selectedEntry.orgDisplayName,
      language
    ),
    lastUpdated: selectedEntry.lastUpdated,
    kpis: buildKpis(selectedEntry, language),
    trends: buildTrend(selectedEntry, meta.baseMonth),
    divisionComposition: buildDivisionComposition(entries, language),
    categoryDistribution: buildCategoryDistribution(selectedEntry, language),
    stackedSeries: buildStackedSeries(selectedEntry, language),
    targetProgress: buildTargetProgress(selectedEntry),
    movementInfographic: buildMovementInfographic(entries, language)
  };
};
