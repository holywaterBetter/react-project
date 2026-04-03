import orgDivisionCountJson from '@assets/org_division_count.json';
import orgStructureJson from '@assets/org_structure_300.json';
import type { OrganizationCategoryCode } from '@constants/organizationCategoryMap';
import type { OrganizationRecord } from '@shared-types/org';

type CategoryCountMap = Partial<Record<OrganizationCategoryCode, number>>;

export type OrganizationDivisionCountRecord = {
  org_code: string;
  org_name: string;
  org_division_code: string;
  org_division_name: string;
  upper_org_code: string;
  updated_date: string;
  org_category_code: string;
  org_category_name: string;
  headcount_20251231_total: number;
  headcount_20251231_by_category: CategoryCountMap;
  headcount_20261231_target_total: number;
  headcount_20261231_target_by_category: CategoryCountMap;
  headcount_current_total: number;
  headcount_current_by_category: CategoryCountMap;
  reallocation_target_20261231_by_category: CategoryCountMap;
  reallocation_current_cumulative_by_category: CategoryCountMap;
  org_division_name_en: string;
  org_category_name_en: string;
};

type DivisionCountQuery = {
  snapshotMonth?: string;
};

const MOCK_DELAY_MS = 220;

const delay = async (ms = MOCK_DELAY_MS) =>
  new Promise((resolve) => globalThis.setTimeout(resolve, ms));

const cloneCategoryCountMap = (value: CategoryCountMap | undefined): CategoryCountMap => ({
  ...(value ?? {})
});

const cloneDivisionCountRecord = (
  record: OrganizationDivisionCountRecord
): OrganizationDivisionCountRecord => ({
  ...record,
  headcount_20251231_by_category: cloneCategoryCountMap(record.headcount_20251231_by_category),
  headcount_20261231_target_by_category: cloneCategoryCountMap(record.headcount_20261231_target_by_category),
  headcount_current_by_category: cloneCategoryCountMap(record.headcount_current_by_category),
  reallocation_target_20261231_by_category: cloneCategoryCountMap(
    record.reallocation_target_20261231_by_category
  ),
  reallocation_current_cumulative_by_category: cloneCategoryCountMap(
    record.reallocation_current_cumulative_by_category
  )
});

const divisionCountRecords = (orgDivisionCountJson as OrganizationDivisionCountRecord[]).map(
  cloneDivisionCountRecord
);
const organizationStructureRecords = (orgStructureJson as OrganizationRecord[]).map((record) => ({
  ...record
}));

export const organizationWorkforceDataService = {
  async getDivisionCountRecords(
    query?: DivisionCountQuery
  ): Promise<OrganizationDivisionCountRecord[]> {
    // const response = await axios.get<OrganizationDivisionCountRecord[]>(
    //   '/api/organization/workforce/division-count',
    //   { params: query }
    // );
    // return response.data;

    void query;
    await delay();
    return divisionCountRecords.map(cloneDivisionCountRecord);
  },

  async getOrganizationStructure(): Promise<OrganizationRecord[]> {
    // const response = await axios.get<OrganizationRecord[]>('/api/organization/structure');
    // return response.data;

    await delay();
    return organizationStructureRecords.map((record) => ({ ...record }));
  }
};
