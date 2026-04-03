import type { DevUserMode } from '@features/auth/types/devUserMode';
import type { OrganizationRecord } from '@shared-types/org';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type ApprovalFieldChange = {
  field: keyof Pick<
    OrganizationRecord,
    'updated_date' | 'org_division_name' | 'org_department_name' | 'org_category_name'
  >;
  before: string;
  after: string;
};

export type ApprovalChangeRow = {
  orgCode: string;
  orgName: string;
  divisionName: string;
  before: OrganizationRecord;
  after: OrganizationRecord;
  changedFields: ApprovalFieldChange[];
};

export type ApprovalDecision = {
  note: string;
  decidedAt: string;
  decidedByUserId: string;
  decidedByLabel: string;
};

export type ApprovalChangeRequest = {
  id: string;
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
  rows: ApprovalChangeRow[];
};
