import type { OrganizationCategoryCode } from '@constants/organizationCategoryMap';

export type DashboardPeriodKey = 'actual2025' | 'target2026' | 'current202604';

export type DashboardMetric = {
  headcount: number;
  reallocated: number;
};

export type DashboardCategoryPeriodMap = Record<DashboardPeriodKey, DashboardMetric>;

export type OrganizationWorkforceDashboardEntry = {
  orgCode: string;
  orgName: string;
  orgDisplayName: string;
  sourceRecordCount: number;
  lastUpdated: string;
  categoryMetrics: Record<OrganizationCategoryCode, DashboardCategoryPeriodMap>;
};

export type OrganizationWorkforceDashboardMeta = {
  baseMonth: string;
  compareLabel: string;
  currentLabel: string;
  targetLabel: string;
  lastUpdated: string;
  availableSnapshotMonths: string[];
  organizationOptions: Array<{
    orgCode: string;
    orgName: string;
    orgDisplayName: string;
  }>;
};

export type OrganizationCategoryMappingItem = {
  code: OrganizationCategoryCode;
  groupLabel: string;
  displayLabel: string;
  dashboardLabel: string;
};

export type OrganizationCategoryMappingResponse = OrganizationCategoryMappingItem[];

export type DashboardApiResponse<T, TMeta = Record<string, unknown>> = {
  success: boolean;
  data: T;
  message: string;
  meta: TMeta;
};

export type DashboardTableCell = {
  headcount: number;
  ratio: number;
  delta?: number | null;
  reallocated: number;
};

export type DashboardTableRow = {
  id: string;
  label: string;
  level: number;
  tone: 'total' | 'group' | 'summary' | 'detail';
  actual2025: DashboardTableCell;
  target2026: DashboardTableCell;
  current202604: DashboardTableCell;
};

export type DashboardTableSection = {
  orgCode: string;
  orgName: string;
  orgDisplayName: string;
  lastUpdated: string;
  sourceRecordCount: number;
  rows: DashboardTableRow[];
};

export type OrganizationWorkforceDashboardListResponse = OrganizationWorkforceDashboardEntry[];

export type OrganizationWorkforceDashboardQuery = {
  orgCode?: string;
  snapshotMonth?: string;
  simulateError?: boolean;
};
