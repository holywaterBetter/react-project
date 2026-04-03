import { orgMockApi } from '@api/orgMockApi';
import { organizationCategoryCodes, organizationCategoryMap, type OrganizationCategoryCode } from '@constants/organizationCategoryMap';
import type {
  DashboardApiResponse,
  DashboardCategoryPeriodMap,
  OrganizationCategoryMappingResponse,
  OrganizationWorkforceDashboardEntry,
  OrganizationWorkforceDashboardMeta,
  OrganizationWorkforceDashboardQuery
} from '@pages/organization-workforce-dashboard/types/organizationWorkforceDashboard';
import type { OrganizationTreeNode } from '@shared-types/org';

const MOCK_DELAY_MS = 420;

const PERIOD_KEYS = ['actual2025', 'target2026', 'current202604'] as const;

const periodMeta = {
  actual2025: { label: "'25년말 실적" },
  target2026: { label: "'26년말 목표" },
  current202604: { label: "'26.4월 현재 실적" }
} as const;

const categoryMultipliers: Record<OrganizationCategoryCode, Record<(typeof PERIOD_KEYS)[number], number>> = {
  A1: {
    actual2025: 1.04,
    current202604: 0.97,
    target2026: 0.92
  },
  B1: {
    actual2025: 0.94,
    current202604: 1.08,
    target2026: 1.18
  },
  B2: {
    actual2025: 0.95,
    current202604: 1.1,
    target2026: 1.22
  },
  B3: {
    actual2025: 0.9,
    current202604: 1.14,
    target2026: 1.28
  },
  C1: {
    actual2025: 0.92,
    current202604: 1.06,
    target2026: 1.12
  }
};

const categoryReallocationFactors: Record<OrganizationCategoryCode, Record<(typeof PERIOD_KEYS)[number], number>> = {
  A1: {
    actual2025: 0.05,
    current202604: 0.08,
    target2026: 0.11
  },
  B1: {
    actual2025: 0.03,
    current202604: 0.05,
    target2026: 0.07
  },
  B2: {
    actual2025: 0.04,
    current202604: 0.06,
    target2026: 0.08
  },
  B3: {
    actual2025: 0.05,
    current202604: 0.07,
    target2026: 0.09
  },
  C1: {
    actual2025: 0.03,
    current202604: 0.04,
    target2026: 0.06
  }
};

const delay = async (ms = MOCK_DELAY_MS) => new Promise((resolve) => globalThis.setTimeout(resolve, ms));

const hashString = (value: string) =>
  [...value].reduce((accumulator, character, index) => accumulator + character.charCodeAt(0) * (index + 17), 0);

const toDisplayName = (name: string, fallbackCode: string) => {
  const asciiMatch = name.match(/[A-Za-z]+(?:\/[A-Za-z]+)?/);
  if (asciiMatch) {
    return asciiMatch[0];
  }

  return fallbackCode;
};

const flattenTree = (node: OrganizationTreeNode): OrganizationTreeNode[] => [
  node,
  ...node.children.flatMap((child) => flattenTree(child))
];

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
  record: OrganizationTreeNode
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

const toDashboardEntry = (node: OrganizationTreeNode): OrganizationWorkforceDashboardEntry => {
  const allNodes = flattenTree(node);
  const categoryMetrics = createEmptyCategoryMetrics();

  allNodes.forEach((record) => {
    addRecordMetrics(categoryMetrics, record);
  });

  const lastUpdated = allNodes.reduce((latest, current) => (current.updated_date > latest ? current.updated_date : latest), node.updated_date);

  return {
    orgCode: node.org_code,
    orgName: node.org_name,
    orgDisplayName: toDisplayName(node.org_name, node.org_code),
    sourceRecordCount: allNodes.length,
    lastUpdated,
    categoryMetrics
  };
};

const buildDashboardEntries = async () => {
  const treeResponse = await orgMockApi.getOrganizationTree();
  const sections = treeResponse.data.map(toDashboardEntry);

  const overallEntry = sections.reduce<OrganizationWorkforceDashboardEntry>(
    (accumulator, current) => {
      organizationCategoryCodes.forEach((categoryCode) => {
        PERIOD_KEYS.forEach((periodKey) => {
          accumulator.categoryMetrics[categoryCode][periodKey].headcount += current.categoryMetrics[categoryCode][periodKey].headcount;
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
      orgName: '전사',
      orgDisplayName: '전사',
      sourceRecordCount: 0,
      lastUpdated: '',
      categoryMetrics: createEmptyCategoryMetrics()
    }
  );

  return {
    sections,
    overallEntry
  };
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
    query?: OrganizationWorkforceDashboardQuery
  ): Promise<DashboardApiResponse<OrganizationWorkforceDashboardEntry[], { totalCount: number }>> {
    return simulateResponse(async () => {
      const { sections, overallEntry } = await buildDashboardEntries();
      const items = query?.orgCode ? sections.filter((section) => section.orgCode === query.orgCode) : [overallEntry, ...sections];

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
    orgCode: string,
    query?: Pick<OrganizationWorkforceDashboardQuery, 'simulateError'>
  ): Promise<DashboardApiResponse<OrganizationWorkforceDashboardEntry | null, { requestedOrgCode: string }>> {
    return simulateResponse(async () => {
      const { sections, overallEntry } = await buildDashboardEntries();
      const target = orgCode === 'ALL' ? overallEntry : sections.find((section) => section.orgCode === orgCode) ?? null;

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
    query?: Pick<OrganizationWorkforceDashboardQuery, 'simulateError'>
  ): Promise<DashboardApiResponse<OrganizationWorkforceDashboardMeta, { totalOrganizations: number }>> {
    return simulateResponse(async () => {
      const { sections, overallEntry } = await buildDashboardEntries();

      return {
        data: {
          baseMonth: '2026.04',
          compareLabel: periodMeta.actual2025.label,
          currentLabel: periodMeta.current202604.label,
          targetLabel: periodMeta.target2026.label,
          lastUpdated: overallEntry.lastUpdated,
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
