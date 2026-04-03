import orgStructureJson from '@assets/org_structure_300.json';
import type { ApiEnvelope } from '@shared-types/api';
import type {
  OrganizationCategorySummary,
  OrganizationListParams,
  OrganizationListResponse,
  OrganizationRecord,
  OrganizationTreeNode
} from '@shared-types/org';

const MOCK_DELAY_MS = 150;

const organizationRecords = [...(orgStructureJson as OrganizationRecord[])].sort((left, right) =>
  left.org_code.localeCompare(right.org_code)
);

const organizationCodeSet = new Set(organizationRecords.map((organization) => organization.org_code));

const rootOrganizations = organizationRecords.filter(
  (organization) => !organizationCodeSet.has(organization.upper_org_code)
);

const delay = async (ms = MOCK_DELAY_MS) => new Promise((resolve) => globalThis.setTimeout(resolve, ms));

const includesIgnoreCase = (value: string, keyword: string) => value.toLowerCase().includes(keyword.toLowerCase());

const normalizePagination = (params?: OrganizationListParams) => {
  const offset = Math.max(0, params?.offset ?? 0);
  const limit = Math.max(1, params?.limit ?? organizationRecords.length);

  return { offset, limit };
};

const filterOrganizations = (params?: OrganizationListParams) => {
  const search = params?.search?.trim();

  return organizationRecords.filter((organization) => {
    if (params?.divisionCode && organization.org_division_code !== params.divisionCode) {
      return false;
    }

    if (params?.categoryCode && organization.org_category_code !== params.categoryCode) {
      return false;
    }

    if (params?.upperOrgCode && organization.upper_org_code !== params.upperOrgCode) {
      return false;
    }

    if (
      search &&
      !includesIgnoreCase(organization.org_code, search) &&
      !includesIgnoreCase(organization.org_name, search) &&
      !includesIgnoreCase(organization.org_division_name, search) &&
      !includesIgnoreCase(organization.org_category_name, search)
    ) {
      return false;
    }

    return true;
  });
};

const buildOrganizationTree = (upperOrgCode: string): OrganizationTreeNode[] =>
  organizationRecords
    .filter((organization) => organization.upper_org_code === upperOrgCode)
    .map((organization) => ({
      ...organization,
      children: buildOrganizationTree(organization.org_code)
    }));

export const orgMockApi = {
  async getOrganizations(params?: OrganizationListParams): Promise<ApiEnvelope<OrganizationListResponse>> {
    await delay();

    const filteredItems = filterOrganizations(params);
    const { offset, limit } = normalizePagination(params);

    return {
      data: {
        items: filteredItems.slice(offset, offset + limit),
        total: filteredItems.length,
        offset,
        limit
      },
      message: 'Mock organization list fetched successfully.'
    };
  },

  async getOrganizationByCode(orgCode: string): Promise<ApiEnvelope<OrganizationRecord | null>> {
    await delay();

    const organization = organizationRecords.find((item) => item.org_code === orgCode) ?? null;

    return {
      data: organization,
      message: organization ? 'Mock organization detail fetched successfully.' : 'Organization not found.'
    };
  },

  async getOrganizationChildren(upperOrgCode: string): Promise<ApiEnvelope<OrganizationRecord[]>> {
    await delay();

    return {
      data: organizationRecords.filter((organization) => organization.upper_org_code === upperOrgCode),
      message: 'Mock organization children fetched successfully.'
    };
  },

  async getOrganizationTree(rootOrgCode?: string): Promise<ApiEnvelope<OrganizationTreeNode[]>> {
    await delay();

    if (rootOrgCode) {
      const rootOrganization = organizationRecords.find((organization) => organization.org_code === rootOrgCode);

      if (!rootOrganization) {
        return {
          data: [],
          message: 'Root organization not found.'
        };
      }

      return {
        data: [
          {
            ...rootOrganization,
            children: buildOrganizationTree(rootOrganization.org_code)
          }
        ],
        message: 'Mock organization tree fetched successfully.'
      };
    }

    return {
      data: rootOrganizations.map((organization) => ({
        ...organization,
        children: buildOrganizationTree(organization.org_code)
      })),
      message: 'Mock organization tree fetched successfully.'
    };
  },

  async getOrganizationCategories(): Promise<ApiEnvelope<OrganizationCategorySummary[]>> {
    await delay();

    const categories = organizationRecords.reduce<Map<string, OrganizationCategorySummary>>((accumulator, organization) => {
      const current = accumulator.get(organization.org_category_code);

      if (current) {
        current.count += 1;
        return accumulator;
      }

      accumulator.set(organization.org_category_code, {
        categoryCode: organization.org_category_code,
        categoryName: organization.org_category_name,
        count: 1
      });

      return accumulator;
    }, new Map());

    return {
      data: [...categories.values()].sort((left, right) => left.categoryCode.localeCompare(right.categoryCode)),
      message: 'Mock organization categories fetched successfully.'
    };
  }
};

export const orgMockApiEndpoints = {
  list: '/mock/organizations',
  detail: '/mock/organizations/:orgCode',
  children: '/mock/organizations/:orgCode/children',
  tree: '/mock/organizations/tree',
  categories: '/mock/organizations/categories'
} as const;
