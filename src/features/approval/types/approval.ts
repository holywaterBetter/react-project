import type { OrganizationCategoryCode } from '@constants/organizationCategoryMap';
import type { DevUserMode } from '@features/auth/types/devUserMode';
import type { OrganizationRecord } from '@shared-types/org';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type ApprovalRequestType = 'organization' | 'workforce-target';

export type ApprovalFieldChange<TField extends string = string> = {
  field: TField;
  before: string;
  after: string;
};

export type ApprovalChangeRowBase<TBefore, TAfter, TField extends string = string> = {
  key: string;
  orgCode: string;
  orgName: string;
  divisionName: string;
  before: TBefore;
  after: TAfter;
  changedFields: ApprovalFieldChange<TField>[];
};

export type OrganizationApprovalField = keyof Pick<
  OrganizationRecord,
  'updated_date' | 'org_division_name' | 'org_department_name' | 'org_category_name'
>;

export type OrganizationApprovalChangeRow = ApprovalChangeRowBase<
  OrganizationRecord,
  OrganizationRecord,
  OrganizationApprovalField
>;

export type WorkforceTargetCategoryMap = Partial<Record<OrganizationCategoryCode, number>>;

export type WorkforceTargetRecord = {
  org_code: string;
  org_name: string;
  org_division_code: string;
  org_division_name: string;
  updated_date: string;
  headcount_target_by_category: WorkforceTargetCategoryMap;
  reallocation_target_by_category: WorkforceTargetCategoryMap;
};

export type WorkforceTargetApprovalField =
  | 'updated_date'
  | `headcount_target_by_category.${OrganizationCategoryCode}`
  | `reallocation_target_by_category.${OrganizationCategoryCode}`;

export type WorkforceTargetApprovalChangeRow = ApprovalChangeRowBase<
  WorkforceTargetRecord,
  WorkforceTargetRecord,
  WorkforceTargetApprovalField
>;

export type ApprovalChangeRow = OrganizationApprovalChangeRow | WorkforceTargetApprovalChangeRow;

export type ApprovalDecision = {
  note: string;
  decidedAt: string;
  decidedByUserId: string;
  decidedByLabel: string;
};

export type ApprovalChangeRequest = {
  id: string;
  type: ApprovalRequestType;
  status: ApprovalStatus;
  submittedAt: string;
  submittedByUserId: string;
  submittedByLabel: string;
  divisionName: string;
  changedRows: ApprovalChangeRow[];
  totalChangedRows: number;
  decision: ApprovalDecision | null;
};

export type CreateApprovalRequestPayload = {
  submittedBy: DevUserMode;
  type: ApprovalRequestType;
  rows: ApprovalChangeRow[];
};
