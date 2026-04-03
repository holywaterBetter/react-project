import { organizationCategoryCodes } from '@constants/organizationCategoryMap';
import { canSeeAllDivisions, getDivisionNameByCode, type DevUserMode } from '@features/auth/types/devUserMode';
import { workforceRepository } from '@services/workforceRepository';
import type {
  OrganizationCategorySummary,
  OrganizationDivisionSummary,
  OrganizationListResponse,
  OrganizationQueryState,
  OrganizationRecord,
  OrganizationSortModel
} from '@shared-types/org';

const allowedCategoryCodeSet = new Set<string>(organizationCategoryCodes);

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

const filterOrganizations = (items: OrganizationRecord[], query: OrganizationQueryState) => {
  const keyword = query.filters.search.trim().toLowerCase();

  return items.filter((organization) => {
    if (query.filters.divisionCode && organization.org_division_name !== query.filters.divisionCode) {
      return false;
    }

    if (query.filters.categoryCode && organization.org_category_code !== query.filters.categoryCode) {
      return false;
    }

    if (
      keyword &&
      ![organization.org_name, organization.org_code, organization.org_division_name, organization.org_category_name].some(
        (value) => value.toLowerCase().includes(keyword)
      )
    ) {
      return false;
    }

    return true;
  });
};

const paginateOrganizations = (items: OrganizationRecord[], query: OrganizationQueryState): OrganizationListResponse => {
  const offset = query.pagination.page * query.pagination.pageSize;
  const limit = query.pagination.pageSize;

  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
    offset,
    limit
  };
};

export const organizationService = {
  allowedCategoryCodes: [...organizationCategoryCodes],

  async getOrganizations(user: DevUserMode, query: OrganizationQueryState): Promise<OrganizationListResponse> {
    const scopedItems = workforceRepository.getScopedOrganizations(user);
    const filtered = filterOrganizations(scopedItems, query);
    const sorted = sortOrganizations(filtered, query.sort);

    return paginateOrganizations(sorted, query);
  },

  async getOrganizationsForExport(user: DevUserMode, query: OrganizationQueryState): Promise<OrganizationRecord[]> {
    const scopedItems = workforceRepository.getScopedOrganizations(user);
    return sortOrganizations(filterOrganizations(scopedItems, query), query.sort);
  },

  async getEffectiveOrganizations() {
    return workforceRepository.getEffectiveOrganizations();
  },

  async getOrganizationByCode(user: DevUserMode, orgCode: string) {
    return workforceRepository.getOrganizationByCode(user, orgCode);
  },

  async getOrganizationTree(user: DevUserMode, rootOrgCode?: string) {
    return workforceRepository.getOrganizationTree(user, rootOrgCode);
  },

  async getOrganizationCategories(user: DevUserMode): Promise<OrganizationCategorySummary[]> {
    return workforceRepository
      .getOrganizationCategories(user)
      .filter((category) => allowedCategoryCodeSet.has(category.categoryCode));
  },

  async getOrganizationDivisions(user: DevUserMode): Promise<OrganizationDivisionSummary[]> {
    const divisions = workforceRepository.getOrganizationDivisions(user);

    if (canSeeAllDivisions(user)) {
      return divisions;
    }

    const divisionName = getDivisionNameByCode(user.divisionCode);

    return divisions.filter((division) => division.divisionName === divisionName);
  },

  async applyOrganizationUpdates(user: DevUserMode, rows: OrganizationRecord[]) {
    if (!canSeeAllDivisions(user)) {
      throw new Error('Division HR uploads must be approved before they are applied.');
    }

    workforceRepository.applyOrganizationRows(rows);
    return rows.length;
  }
};
