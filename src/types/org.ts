export type OrganizationRecord = {
  org_code: string;
  org_name: string;
  org_division_code: string;
  org_division_name: string;
  upper_org_code: string;
  updated_date: string;
  org_category_code: string;
  org_category_name: string;
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
