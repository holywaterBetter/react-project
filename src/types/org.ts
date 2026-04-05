export type OrganizationRecord = {
  org_code: string;
  org_name: string;
  org_division_code: string;
  org_division_name: string;
  upper_org_code: string;
  updated_date: string;
  org_category_code: string;
  org_category_name: string;
  org_division_name_en: string;
  org_category_name_en: string;
  org_department_name: string;
  org_department_name_en: string;
};

export type OrganizationListParams = {
  search?: string;
  divisionCode?: string;
  categoryCode?: string;
  upperOrgCode?: string;
  offset?: number;
  limit?: number;
};

export type OrganizationListResponse = {
  items: OrganizationRecord[];
  total: number;
  offset: number;
  limit: number;
};

export type OrganizationTreeNode = OrganizationRecord & {
  children: OrganizationTreeNode[];
};

export type OrganizationCategorySummary = {
  categoryCode: string;
  categoryName: string;
  count: number;
};

export type OrganizationDivisionSummary = {
  divisionCode: string;
  divisionName: string;
  count: number;
};

export type OrganizationSortField = 'updated_date' | 'org_division_name';

export type OrganizationSortDirection = 'asc' | 'desc';

export type OrganizationSortModel = {
  field: OrganizationSortField;
  direction: OrganizationSortDirection;
};

export type OrganizationTableFilters = {
  search: string;
  divisionCode: string;
  categoryCode: string;
};

export type OrganizationTablePagination = {
  page: number;
  pageSize: number;
};

export type OrganizationQueryState = {
  filters: OrganizationTableFilters;
  pagination: OrganizationTablePagination;
  sort: OrganizationSortModel;
};

export type OrganizationUploadRow = {
  baseMonth: string;
  divisionName: string;
  organizationName: string;
  organizationCode: string;
  categoryName: string;
};

export type OrganizationUploadValidationError = {
  rowNumber: number;
  column: string;
  message: string;
  value?: string;
};

export type OrganizationUploadResult = {
  validRows: OrganizationRecord[];
  errors: OrganizationUploadValidationError[];
  totalRows: number;
};


export type WorkforceTargetUploadRow = {
  baseMonth: string;
  divisionName: string;
  divisionCode: string;
  organizationCode: string;
  targetByCategory: Record<'A1' | 'B1' | 'B2' | 'B3' | 'C1', string>;
  reallocationByCategory: Record<'A1' | 'B1' | 'B2' | 'B3' | 'C1', string>;
};

export type WorkforceTargetUploadDto = {
  org_code: string;
  updated_date: string;
  headcount_20261231_target_by_category: Partial<Record<'A1' | 'B1' | 'B2' | 'B3' | 'C1', number>>;
  reallocation_target_20261231_by_category: Partial<Record<'A1' | 'B1' | 'B2' | 'B3' | 'C1', number>>;
};

export type WorkforceTargetUploadResult = {
  validRows: WorkforceTargetUploadDto[];
  errors: OrganizationUploadValidationError[];
  totalRows: number;
};
