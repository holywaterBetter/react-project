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
