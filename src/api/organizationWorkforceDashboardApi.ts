import {
  organizationCategoryCodes,
  organizationCategoryMap,
  type OrganizationCategoryCode
} from '@constants/organizationCategoryMap';
import {
  canSeeAllDivisions,
  SMALL_DIVISION_CODES,
  SMALL_DIVISION_GROUP,
  type DevUserMode
} from '@features/auth/types/devUserMode';
import type {
  DashboardApiResponse,
  DashboardCategoryPeriodMap,
  OrganizationCategoryMappingResponse,
  OrganizationWorkforceDashboardEntry,
  OrganizationWorkforceDashboardMeta,
  OrganizationWorkforceDashboardQuery
} from '@pages/organization-workforce-dashboard/types/organizationWorkforceDashboard';
import { organizationWorkforceDataService, type OrganizationDivisionCountRecord } from '@services/organizationWorkforceDataService';
import { workforceRepository } from '@services/workforceRepository';

const ROOT_ORG_CODE = 'C10';
const DEFAULT_BASE_MONTH = '2026.04';

const createEmptyCategoryMetrics = (): Record<OrganizationCategoryCode, DashboardCategoryPeriodMap> =>
  organizationCategoryCodes.reduce(
    (accumulator, categoryCode) => ({
      ...accumulator,
      [categoryCode]: {
        actual2025: { headcount: 0, reallocated: 0 },
        target2026: { headcount: 0, reallocated: 0 },
        current202604: { headcount: 0, reallocated: 0 }
      }
    }),
    {} as Record<OrganizationCategoryCode, DashboardCategoryPeriodMap>
  );

const sumCategoryValue = (
  values: Partial<Record<OrganizationCategoryCode, number>> | undefined,
  categoryCode: OrganizationCategoryCode
) => Number(values?.[categoryCode] ?? 0);

const formatBaseMonth = (updatedDate: string) => {
  if (!/^\d{8}$/.test(updatedDate)) {
    return DEFAULT_BASE_MONTH;
  }

  return `${updatedDate.slice(0, 4)}.${updatedDate.slice(4, 6)}`;
};

const isSmallDivisionGroupEntry = (entry: OrganizationWorkforceDashboardEntry) =>
  entry.orgCode === SMALL_DIVISION_GROUP.code || entry.orgDisplayName === SMALL_DIVISION_GROUP.name;

const sortEntries = (entries: OrganizationWorkforceDashboardEntry[]) =>
  [...entries].sort((left, right) => {
    const leftIsSmallDivisionGroup = isSmallDivisionGroupEntry(left);
    const rightIsSmallDivisionGroup = isSmallDivisionGroupEntry(right);

    if (leftIsSmallDivisionGroup !== rightIsSmallDivisionGroup) {
      return leftIsSmallDivisionGroup ? 1 : -1;
    }

    return left.orgDisplayName.localeCompare(right.orgDisplayName, 'ko');
  });

const mergeCategoryMetrics = (
  accumulator: Record<OrganizationCategoryCode, DashboardCategoryPeriodMap>,
  source: Record<OrganizationCategoryCode, DashboardCategoryPeriodMap>
) => {
  organizationCategoryCodes.forEach((categoryCode) => {
    accumulator[categoryCode].actual2025.headcount += source[categoryCode].actual2025.headcount;
    accumulator[categoryCode].actual2025.reallocated += source[categoryCode].actual2025.reallocated;
    accumulator[categoryCode].target2026.headcount += source[categoryCode].target2026.headcount;
    accumulator[categoryCode].target2026.reallocated += source[categoryCode].target2026.reallocated;
    accumulator[categoryCode].current202604.headcount += source[categoryCode].current202604.headcount;
    accumulator[categoryCode].current202604.reallocated += source[categoryCode].current202604.reallocated;
  });
};

const aggregateEntries = (
  entries: OrganizationWorkforceDashboardEntry[],
  {
    orgCode,
    orgName,
    orgDisplayName
  }: Pick<OrganizationWorkforceDashboardEntry, 'orgCode' | 'orgName' | 'orgDisplayName'>
): OrganizationWorkforceDashboardEntry => {
  const aggregatedEntry: OrganizationWorkforceDashboardEntry = {
    orgCode,
    orgName,
    orgDisplayName,
    sourceRecordCount: 0,
    lastUpdated: '',
    categoryMetrics: createEmptyCategoryMetrics()
  };

  entries.forEach((entry) => {
    aggregatedEntry.sourceRecordCount += entry.sourceRecordCount;
    aggregatedEntry.lastUpdated = entry.lastUpdated > aggregatedEntry.lastUpdated ? entry.lastUpdated : aggregatedEntry.lastUpdated;
    mergeCategoryMetrics(aggregatedEntry.categoryMetrics, entry.categoryMetrics);
  });

  return aggregatedEntry;
};

const aggregateSmallDivisionSections = (sections: OrganizationWorkforceDashboardEntry[]) => {
  const smallDivisionCodeSet = new Set<string>(SMALL_DIVISION_CODES);
  const groupedSections = sections.filter((section) => smallDivisionCodeSet.has(section.orgCode));

  if (groupedSections.length === 0) {
    return sections;
  }

  return sortEntries([
    ...sections.filter((section) => !smallDivisionCodeSet.has(section.orgCode)),
    aggregateEntries(groupedSections, {
      orgCode: SMALL_DIVISION_GROUP.code,
      orgName: SMALL_DIVISION_GROUP.name,
      orgDisplayName: SMALL_DIVISION_GROUP.name
    })
  ]);
};

const toDashboardEntry = (
  record: OrganizationDivisionCountRecord,
  overrides?: Partial<Pick<OrganizationWorkforceDashboardEntry, 'orgCode' | 'orgName' | 'orgDisplayName'>>
): OrganizationWorkforceDashboardEntry => ({
  orgCode: overrides?.orgCode ?? record.org_code,
  orgName: overrides?.orgName ?? record.org_name,
  orgDisplayName: overrides?.orgDisplayName ?? record.org_division_name ?? record.org_name,
  sourceRecordCount: 1,
  lastUpdated: record.updated_date,
  categoryMetrics: organizationCategoryCodes.reduce(
    (accumulator, categoryCode) => ({
      ...accumulator,
      [categoryCode]: {
        actual2025: {
          headcount: sumCategoryValue(record.headcount_20251231_by_category, categoryCode),
          reallocated: 0
        },
        target2026: {
          headcount: sumCategoryValue(record.headcount_20261231_target_by_category, categoryCode),
          reallocated: sumCategoryValue(record.reallocation_target_20261231_by_category, categoryCode)
        },
        current202604: {
          headcount: sumCategoryValue(record.headcount_current_by_category, categoryCode),
          reallocated: sumCategoryValue(record.reallocation_current_cumulative_by_category, categoryCode)
        }
      }
    }),
    {} as Record<OrganizationCategoryCode, DashboardCategoryPeriodMap>
  )
});

const buildPeriodMeta = (
  records: OrganizationDivisionCountRecord[]
): Pick<OrganizationWorkforceDashboardMeta, 'baseMonth' | 'compareLabel' | 'targetLabel' | 'currentLabel'> => {
  const latestRecord = [...records].sort((left, right) => right.updated_date.localeCompare(left.updated_date))[0];
  const baseMonth = formatBaseMonth(latestRecord?.updated_date ?? '');

  return {
    baseMonth,
    compareLabel: "'25 Actual",
    targetLabel: "'26 Target",
    currentLabel: `${baseMonth} Current`
  };
};

const applyTargetOverrides = (records: OrganizationDivisionCountRecord[], user: DevUserMode) => {
  const targetByOrgCode = new Map(
    workforceRepository.getScopedWorkforceTargets(user).map((target) => [target.org_code, target])
  );

  return records.map((record) => {
    const target = targetByOrgCode.get(record.org_code);

    if (!target) {
      return record;
    }

    return {
      ...record,
      updated_date: target.updated_date || record.updated_date,
      headcount_20261231_target_by_category: { ...target.headcount_target_by_category },
      reallocation_target_20261231_by_category: { ...target.reallocation_target_by_category }
    };
  });
};

const buildScopedEntries = async (
  user: DevUserMode,
  query?: Pick<OrganizationWorkforceDashboardQuery, 'snapshotMonth'>
) => {
  const records = applyTargetOverrides(
    await organizationWorkforceDataService.getDivisionCountRecords({
      snapshotMonth: query?.snapshotMonth
    }),
    user
  );
  const periodMeta = buildPeriodMeta(records);
  const overallRecord = records.find((record) => record.org_code === ROOT_ORG_CODE) ?? null;
  const divisionRecords = records.filter((record) => record.org_code !== ROOT_ORG_CODE && Boolean(record.org_division_code));
  const scopedDivisionRecords = canSeeAllDivisions(user)
    ? divisionRecords
    : divisionRecords.filter((record) => record.org_code === user.divisionCode);
  const rawSections = sortEntries(scopedDivisionRecords.map((record) => toDashboardEntry(record)));
  const sections = canSeeAllDivisions(user) ? aggregateSmallDivisionSections(rawSections) : rawSections;
  const overallEntry = canSeeAllDivisions(user)
    ? overallRecord
      ? toDashboardEntry(overallRecord, {
          orgCode: 'ALL',
          orgName: overallRecord.org_name,
          orgDisplayName: 'All'
        })
      : aggregateEntries(rawSections, {
          orgCode: 'ALL',
          orgName: 'All Divisions',
          orgDisplayName: 'All'
        })
    : null;

  return { periodMeta, sections, overallEntry };
};

const buildFailureResponse = <T, TMeta>(message: string): DashboardApiResponse<T, TMeta> => ({
  success: false,
  data: [] as unknown as T,
  message,
  meta: {} as TMeta
});

export const organizationWorkforceDashboardApi = {
  async getOrganizationWorkforceDashboardList(
    user: DevUserMode,
    query?: OrganizationWorkforceDashboardQuery
  ): Promise<DashboardApiResponse<OrganizationWorkforceDashboardEntry[], { totalCount: number }>> {
    if (query?.simulateError) {
      return buildFailureResponse('Mock API error has been simulated.');
    }

    const { sections, overallEntry } = await buildScopedEntries(user, query);
    const baseItems = overallEntry ? [overallEntry, ...sections] : sections;
    const items = query?.orgCode ? baseItems.filter((section) => section.orgCode === query.orgCode) : baseItems;

    return {
      success: true,
      data: items,
      message: 'Organization workforce dashboard list fetched successfully.',
      meta: {
        totalCount: items.length
      }
    };
  },

  async getOrganizationWorkforceDashboardByOrg(
    user: DevUserMode,
    orgCode: string,
    query?: OrganizationWorkforceDashboardQuery
  ): Promise<DashboardApiResponse<OrganizationWorkforceDashboardEntry | null, { requestedOrgCode: string }>> {
    if (query?.simulateError) {
      return buildFailureResponse('Mock API error has been simulated.');
    }

    const { sections, overallEntry } = await buildScopedEntries(user, query);
    const baseItems = overallEntry ? [overallEntry, ...sections] : sections;
    const target = baseItems.find((section) => section.orgCode === orgCode) ?? null;

    return {
      success: true,
      data: target,
      message: target
        ? 'Organization workforce dashboard detail fetched successfully.'
        : 'Organization dashboard entry not found.',
      meta: {
        requestedOrgCode: orgCode
      }
    };
  },

  async getOrganizationWorkforceDashboardMeta(
    user: DevUserMode,
    query?: OrganizationWorkforceDashboardQuery
  ): Promise<DashboardApiResponse<OrganizationWorkforceDashboardMeta, { totalOrganizations: number }>> {
    if (query?.simulateError) {
      return buildFailureResponse('Mock API error has been simulated.');
    }

    const { periodMeta, sections, overallEntry } = await buildScopedEntries(user, query);

    return {
      success: true,
      data: {
        ...periodMeta,
        lastUpdated: overallEntry?.lastUpdated ?? sections[0]?.lastUpdated ?? '',
        availableSnapshotMonths: [periodMeta.baseMonth],
        organizationOptions: sections.map((section) => ({
          orgCode: section.orgCode,
          orgName: section.orgName,
          orgDisplayName: section.orgDisplayName
        }))
      },
      message: 'Organization workforce dashboard meta fetched successfully.',
      meta: {
        totalOrganizations: sections.length
      }
    };
  },

  async getOrganizationCategoryMappings(
    query?: Pick<OrganizationWorkforceDashboardQuery, 'simulateError'>
  ): Promise<DashboardApiResponse<OrganizationCategoryMappingResponse, { totalMappings: number }>> {
    if (query?.simulateError) {
      return buildFailureResponse('Mock API error has been simulated.');
    }

    const mappings = organizationCategoryCodes.map((categoryCode) => ({
      code: categoryCode,
      groupLabel: organizationCategoryMap[categoryCode].groupLabel,
      displayLabel: organizationCategoryMap[categoryCode].displayLabel,
      dashboardLabel: organizationCategoryMap[categoryCode].dashboardLabel
    }));

    return {
      success: true,
      data: mappings,
      message: 'Organization category mappings fetched successfully.',
      meta: {
        totalMappings: mappings.length
      }
    };
  }
};
