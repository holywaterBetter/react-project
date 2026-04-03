import type { ApprovalChangeRow } from '@features/approval/types/approval';
import { canApproveChanges, type DevUserMode } from '@features/auth/types/devUserMode';
import { workforceRepository } from '@services/workforceRepository';
import type { OrganizationRecord } from '@shared-types/org';

const APPROVAL_FIELDS: Array<
  keyof Pick<
    OrganizationRecord,
    'updated_date' | 'org_division_name' | 'org_name' | 'org_category_code' | 'org_category_name'
  >
> = ['updated_date', 'org_division_name', 'org_name', 'org_category_code', 'org_category_name'];

export const approvalService = {
  listRequests(user: DevUserMode) {
    return workforceRepository.listPendingChangeRequests(user);
  },

  getRequest(user: DevUserMode, requestId: string) {
    return workforceRepository.getChangeRequestById(user, requestId);
  },

  submitRequest(user: DevUserMode, rows: ApprovalChangeRow[]) {
    return workforceRepository.createPendingChangeRequest({
      submittedBy: user,
      rows
    });
  },

  buildChangeRows(user: DevUserMode, nextRows: OrganizationRecord[]) {
    const currentByCode = new Map(
      workforceRepository.getScopedOrganizations(user).map((record) => [record.org_code, record])
    );

    return nextRows.flatMap<ApprovalChangeRow>((row) => {
      const current = currentByCode.get(row.org_code);

      if (!current) {
        return [];
      }

      const changedFields = APPROVAL_FIELDS.flatMap((field) =>
        current[field] === row[field]
          ? []
          : [
              {
                field,
                before: current[field],
                after: row[field]
              }
            ]
      );

      if (changedFields.length === 0) {
        return [];
      }

      return [
        {
          orgCode: row.org_code,
          orgName: row.org_name,
          divisionName: row.org_division_name,
          before: { ...current },
          after: { ...row },
          changedFields
        }
      ];
    });
  },

  approveRequest(user: DevUserMode, requestId: string, note: string) {
    if (!canApproveChanges(user)) {
      throw new Error('You do not have permission to approve changes.');
    }

    return workforceRepository.applyApprovedChanges(requestId, user, note);
  },

  rejectRequest(user: DevUserMode, requestId: string, note: string) {
    if (!canApproveChanges(user)) {
      throw new Error('You do not have permission to reject changes.');
    }

    return workforceRepository.rejectChangeRequest(requestId, user, note);
  }
};
