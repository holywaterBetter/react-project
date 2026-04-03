import { organizationCategoryCodes, organizationCategoryMap, type OrganizationCategoryCode } from '@constants/organizationCategoryMap';
import {
  canSeeAllDivisions,
  DIVISION_INFOS,
  getDivisionNameByCode,
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
import { workforceRepository } from '@services/workforceRepository';
import type { OrganizationRecord } from '@shared-types/org';

const MOCK_DELAY_MS = 220;
const PERIOD_KEYS = ['actual2025', 'target2026', 'current202604'] as const;
const divisionCodeSet = new Set(DIVISION_INFOS.map((division) => division.code));
const divisionCodeByName = new Map(DIVISION_INFOS.map((division) => [division.name, division.code]));

const periodMeta = {
  actual2025: { label: "'25 Actual" },
  target2026: { label: "'26 Target" },
  current202604: { label: '2026.04 Current' }
} as const;

const categoryMultipliers: Record<OrganizationCategoryCode, Record<(typeof PERIOD_KEYS)[number], number>> = {
  A1: { actual2025: 1.04, current202604: 0.97, target2026: 0.92 },
  B1: { actual2025: 0.94, current202604: 1.08, target2026: 1.18 },
  B2: { actual2025: 0.95, current202604: 1.1, target2026: 1.22 },
  B3: { actual2025: 0.9, current202604: 1.14, target2026: 1.28 },
  C1: { actual2025: 0.92, current202604: 1.06, target2026: 1.12 }
};

const categoryReallocationFactors: Record<OrganizationCategoryCode, Record<(typeof PERIOD_KEYS)[number], number>> = {
  A1: { actual2025: 0.05, current202604: 0.08, target2026: 0.11 },
  B1: { actual2025: 0.03, current202604: 0.05, target2026: 0.07 },
  B2: { actual2025: 0.04, current202604: 0.06, target2026: 0.08 },
  B3: { actual2025: 0.05, current202604: 0.07, target2026: 0.09 },
  C1: { actual2025: 0.03, current202604: 0.04, target2026: 0.06 }
};

const delay = async (ms = MOCK_DELAY_MS) => new Promise((resolve) => globalThis.setTimeout(resolve, ms));

const hashString = (value: string) =>
  [...value].reduce((accumulator, character, index) => accumulator + character.charCodeAt(0) * (index + 17), 0);

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

const addRecordMetrics = (
  metrics: Record<OrganizationCategoryCode, DashboardCategoryPeriodMap>,
  record: Pick<OrganizationRecord, 'org_category_code' | 'org_code' | 'updated_date'>
) => {
  const categoryCode = record.org_category_code as OrganizationCategoryCode;

  if (!organizationCategoryCodes.includes(categoryCode)) {
    return;
  }

  const baseHeadcount = 10 + (hashString(record.org_code) % 24);
  const baseReallocation = 1 + (hashString(record.updated_date) % 5);

  PERIOD_KEYS.forEach((periodKey) => {
    const multiplier = categoryMultipliers[categoryCode][periodKey];
    const reallocationFactor = categoryReallocationFactors[categoryCode][periodKey];

    metrics[categoryCode][periodKey].headcount += Math.max(1, Math.round(baseHeadcount * multiplier));
    metrics[categoryCode][periodKey].reallocated += Math.max(
      0,
      Math.round(baseReallocation + baseHeadcount * reallocationFactor * 0.1)
    );
  });
};

const getCanonicalDivisionCode = (record: Pick<OrganizationRecord, 'org_division_code' | 'org_division_name'>) => {
  if (divisionCodeSet.has(record.org_division_code)) {
    return record.org_division_code;
  }

  return divisionCodeByName.get(record.org_division_name) ?? record.org_division_code;
};

const toDashboardEntry = (
  divisionCode: string,
  divisionName: string,
  records: OrganizationRecord[]
): OrganizationWorkforceDashboardEntry => {
  const categoryMetrics = createEmptyCategoryMetrics();

  records.forEach((record) => {
    addRecordMetrics(categoryMetrics, record);
  });

  const lastUpdated = records.reduce(
    (latest, current) => (current.updated_date > latest ? current.updated_date : latest),
    records[0]?.updated_date ?? ''
  );

  return {
    orgCode: divisionCode,
    orgName: divisionName,
    orgDisplayName: divisionName,
    sourceRecordCount: records.length,
    lastUpdated,
    categoryMetrics
  };
};

const sortSections = (sections: OrganizationWorkforceDashboardEntry[]) =>
  [...sections].sort((left, right) => left.orgDisplayName.localeCompare(right.orgDisplayName, 'ko'));

const aggregateSmallDivisionSections = (sections: OrganizationWorkforceDashboardEntry[]) => {
  const smallCodeSet = new Set<string>(SMALL_DIVISION_CODES);
  const smallSections = sections.filter((section) => smallCodeSet.has(section.orgCode));

  if (smallSections.length === 0) {
    return sections;
  }

  const groupedSection = smallSections.reduce<OrganizationWorkforceDashboardEntry>(
    (accumulator, current) => {
      organizationCategoryCodes.forEach((categoryCode) => {
        PERIOD_KEYS.forEach((periodKey) => {
          accumulator.categoryMetrics[categoryCode][periodKey].headcount +=
            current.categoryMetrics[categoryCode][periodKey].headcount;
          accumulator.categoryMetrics[categoryCode][periodKey].reallocated +=
            current.categoryMetrics[categoryCode][periodKey].reallocated;
        });
      });

      accumulator.sourceRecordCount += current.sourceRecordCount;
      accumulator.lastUpdated =
        current.lastUpdated > accumulator.lastUpdated ? current.lastUpdated : accumulator.lastUpdated;

      return accumulator;
    },
    {
      orgCode: SMALL_DIVISION_GROUP.code,
      orgName: SMALL_DIVISION_GROUP.name,
      orgDisplayName: SMALL_DIVISION_GROUP.name,
      sourceRecordCount: 0,
      lastUpdated: '',
      categoryMetrics: createEmptyCategoryMetrics()
    }
  );

  return sortSections([
    ...sections.filter((section) => !smallCodeSet.has(section.orgCode)),
    groupedSection
  ]);
};

const buildDashboardEntries = async (user: DevUserMode) => {
  const scopedOrganizations = workforceRepository.getScopedOrganizations(user);
  const divisionRecords = scopedOrganizations.reduce<Map<string, OrganizationRecord[]>>((map, record) => {
    const divisionCode = getCanonicalDivisionCode(record);
    const current = map.get(divisionCode) ?? [];
    current.push(record);
    map.set(divisionCode, current);
    return map;
  }, new Map());

  const rawSections = sortSections(
    [...divisionRecords.entries()].map(([divisionCode, records]) => {
      const divisionRoot = records.find((record) => record.org_code === divisionCode);
      const divisionName =
        divisionRoot?.org_name ?? getDivisionNameByCode(divisionCode) ?? records[0]?.org_division_name ?? divisionCode;

      return toDashboardEntry(divisionCode, divisionName, records);
    })
  );
  const sections = canSeeAllDivisions(user) ? aggregateSmallDivisionSections(rawSections) : rawSections;

  if (!canSeeAllDivisions(user)) {
    return { sections, overallEntry: null };
  }

  const overallEntry = sections.reduce<OrganizationWorkforceDashboardEntry>(
    (accumulator, current) => {
      organizationCategoryCodes.forEach((categoryCode) => {
        PERIOD_KEYS.forEach((periodKey) => {
          accumulator.categoryMetrics[categoryCode][periodKey].headcount +=
            current.categoryMetrics[categoryCode][periodKey].headcount;
          accumulator.categoryMetrics[categoryCode][periodKey].reallocated +=
            current.categoryMetrics[categoryCode][periodKey].reallocated;
        });
      });

      accumulator.sourceRecordCount += current.sourceRecordCount;
      accumulator.lastUpdated = current.lastUpdated > accumulator.lastUpdated ? current.lastUpdated : accumulator.lastUpdated;

      return accumulator;
    },
    {
      orgCode: 'ALL',
      orgName: 'All Divisions',
      orgDisplayName: 'All Divisions',
      sourceRecordCount: 0,
      lastUpdated: '',
      categoryMetrics: createEmptyCategoryMetrics()
    }
  );

  return { sections, overallEntry };
};

const simulateResponse = async <T, TMeta>(
  resolver: () => Promise<{ data: T; meta: TMeta; message: string }>,
  simulateError?: boolean
): Promise<DashboardApiResponse<T, TMeta>> => {
  await delay();

  if (simulateError) {
    return {
      success: false,
      data: ([] as unknown) as T,
      message: 'Mock API error has been simulated.',
      meta: ({} as unknown) as TMeta
    };
  }

  const result = await resolver();

  return {
    success: true,
    data: result.data,
    message: result.message,
    meta: result.meta
  };
};

export const organizationWorkforceDashboardApi = {
  async getOrganizationWorkforceDashboardList(
    user: DevUserMode,
    query?: OrganizationWorkforceDashboardQuery
  ): Promise<DashboardApiResponse<OrganizationWorkforceDashboardEntry[], { totalCount: number }>> {
    return simulateResponse(async () => {
      const { sections, overallEntry } = await buildDashboardEntries(user);
      const baseItems = overallEntry ? [overallEntry, ...sections] : sections;
      const items = query?.orgCode ? baseItems.filter((section) => section.orgCode === query.orgCode) : baseItems;

      return {
        data: items,
        message: 'Organization workforce dashboard list fetched successfully.',
        meta: {
          totalCount: items.length
        }
      };
    }, query?.simulateError);
  },

  async getOrganizationWorkforceDashboardByOrg(
    user: DevUserMode,
    orgCode: string,
    query?: Pick<OrganizationWorkforceDashboardQuery, 'simulateError'>
  ): Promise<DashboardApiResponse<OrganizationWorkforceDashboardEntry | null, { requestedOrgCode: string }>> {
    return simulateResponse(async () => {
      const { sections, overallEntry } = await buildDashboardEntries(user);
      const baseItems = overallEntry ? [overallEntry, ...sections] : sections;
      const target = baseItems.find((section) => section.orgCode === orgCode) ?? null;

      return {
        data: target,
        message: target ? 'Organization workforce dashboard detail fetched successfully.' : 'Organization dashboard entry not found.',
        meta: {
          requestedOrgCode: orgCode
        }
      };
    }, query?.simulateError);
  },

  async getOrganizationWorkforceDashboardMeta(
    user: DevUserMode,
    query?: Pick<OrganizationWorkforceDashboardQuery, 'simulateError'>
  ): Promise<DashboardApiResponse<OrganizationWorkforceDashboardMeta, { totalOrganizations: number }>> {
    return simulateResponse(async () => {
      const { sections, overallEntry } = await buildDashboardEntries(user);

      return {
        data: {
          baseMonth: '2026.04',
          compareLabel: periodMeta.actual2025.label,
          currentLabel: periodMeta.current202604.label,
          targetLabel: periodMeta.target2026.label,
          lastUpdated: overallEntry?.lastUpdated ?? sections[0]?.lastUpdated ?? '',
          availableSnapshotMonths: ['2026.04'],
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
    }, query?.simulateError);
  },

  async getOrganizationCategoryMappings(
    query?: Pick<OrganizationWorkforceDashboardQuery, 'simulateError'>
  ): Promise<DashboardApiResponse<OrganizationCategoryMappingResponse, { totalMappings: number }>> {
    return simulateResponse(async () => {
      const mappings = organizationCategoryCodes.map((categoryCode) => ({
        code: categoryCode,
        groupLabel: organizationCategoryMap[categoryCode].groupLabel,
        displayLabel: organizationCategoryMap[categoryCode].displayLabel,
        dashboardLabel: organizationCategoryMap[categoryCode].dashboardLabel
      }));

      return {
        data: mappings,
        message: 'Organization category mappings fetched successfully.',
        meta: {
          totalMappings: mappings.length
        }
      };
    }, query?.simulateError);
  }
};
