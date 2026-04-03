import { orgMockApi } from '@api/orgMockApi';
import type {
  OrganizationCategorySummary,
  OrganizationDivisionSummary,
  OrganizationListParams,
  OrganizationListResponse,
  OrganizationQueryState,
  OrganizationRecord,
  OrganizationSortModel
} from '@shared-types/org';

const ALLOWED_CATEGORY_NAMES = ['A (주력)', 'B (AX)', 'B (성장사업)', 'B (신사업)', 'C (주력_고강도)'] as const;
const allowedCategoryNameSet = new Set<string>(ALLOWED_CATEGORY_NAMES);

const compareText = (left: string, right: string) =>
  left.localeCompare(right, 'ko', {
    sensitivity: 'base',
    numeric: true
  });

const compareDate = (left: string, right: string) => left.localeCompare(right);

export const sortOrganizations = (items: OrganizationRecord[], sort: OrganizationSortModel) => {
  const directionFactor = sort.direction === 'asc' ? 1 : -1;

  return [...items].sort((left, right) => {
    let result = 0;

    if (sort.field === 'updated_date') {
      result = compareDate(left.updated_date, right.updated_date);
    }

    if (sort.field === 'org_division_name') {
      result = compareText(left.org_division_name, right.org_division_name);

      if (result === 0) {
        result = compareText(left.org_name, right.org_name);
      }
    }

    if (result === 0) {
      result = compareText(left.org_code, right.org_code);
    }

    return result * directionFactor;
  });
};

const filterByDivision = (items: OrganizationRecord[], divisionName?: string) => {
  if (!divisionName) {
    return items;
  }

  return items.filter((organization) => organization.org_division_name === divisionName);
};

const buildListParams = (query: OrganizationQueryState): OrganizationListParams => ({
  search: query.filters.search || undefined,
  categoryCode: query.filters.categoryCode || undefined,
  offset: query.pagination.page * query.pagination.pageSize,
  limit: query.pagination.pageSize
});

const listWithMockServerSorting = async (query: OrganizationQueryState): Promise<OrganizationListResponse> => {
  const filterParams: OrganizationListParams = {
    search: query.filters.search || undefined,
    categoryCode: query.filters.categoryCode || undefined
  };

  const response = await orgMockApi.getOrganizations(filterParams);
  const filteredItems = filterByDivision(response.data.items, query.filters.divisionCode);
  const sortedItems = sortOrganizations(filteredItems, query.sort);
  const offset = query.pagination.page * query.pagination.pageSize;
  const limit = query.pagination.pageSize;

  return {
    items: sortedItems.slice(offset, offset + limit),
    total: sortedItems.length,
    offset,
    limit
  };
};

export const organizationService = {
  allowedCategoryNames: [...ALLOWED_CATEGORY_NAMES],

  async getOrganizations(query: OrganizationQueryState): Promise<OrganizationListResponse> {
    if (query.sort.field === 'updated_date' && query.sort.direction === 'desc' && !query.filters.divisionCode) {
      const response = await orgMockApi.getOrganizations(buildListParams(query));
      return response.data;
    }

    return listWithMockServerSorting(query);
  },

  async getOrganizationsForExport(query: OrganizationQueryState): Promise<OrganizationRecord[]> {
    const response = await orgMockApi.getOrganizations({
      search: query.filters.search || undefined,
      categoryCode: query.filters.categoryCode || undefined
    });

    return sortOrganizations(filterByDivision(response.data.items, query.filters.divisionCode), query.sort);
  },

  async getOrganizationByCode(orgCode: string) {
    const response = await orgMockApi.getOrganizationByCode(orgCode);
    return response.data;
  },

  async getOrganizationChildren(upperOrgCode: string) {
    const response = await orgMockApi.getOrganizationChildren(upperOrgCode);
    return response.data;
  },

  async getOrganizationTree(rootOrgCode?: string) {
    const response = await orgMockApi.getOrganizationTree(rootOrgCode);
    return response.data;
  },

  async getOrganizationCategories(): Promise<OrganizationCategorySummary[]> {
    const response = await orgMockApi.getOrganizationCategories();

    return response.data.filter((category) => allowedCategoryNameSet.has(category.categoryName));
  },

  async getOrganizationDivisions(): Promise<OrganizationDivisionSummary[]> {
    const response = await orgMockApi.getOrganizationTree();
    const divisions = response.data.map((organization) => ({
      divisionCode: organization.org_division_name,
      divisionName: organization.org_division_name,
      count: 1
    }));

    return divisions.sort((left, right) => compareText(left.divisionName, right.divisionName));
  }
};
