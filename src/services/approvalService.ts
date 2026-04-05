import { organizationCategoryCodes } from '@constants/organizationCategoryMap';
import type {
  ApprovalChangeRow,
  ApprovalRequestType,
  OrganizationApprovalChangeRow,
  OrganizationApprovalField,
  WorkforceTargetApprovalChangeRow,
  WorkforceTargetApprovalField,
  WorkforceTargetRecord
} from '@features/approval/types/approval';
import {
  canApproveChanges,
  canSeeAllDivisions,
  getDivisionNameByCode,
  type DevUserMode
} from '@features/auth/types/devUserMode';
import { workforceRepository } from '@services/workforceRepository';
import type { OrganizationRecord } from '@shared-types/org';

const ORGANIZATION_APPROVAL_FIELDS: OrganizationApprovalField[] = [
  'updated_date',
  'org_division_name',
  'org_department_name',
  'org_category_name'
];

const validateSubmissionPermission = (user: DevUserMode, divisionName: string) => {
  if (canSeeAllDivisions(user)) {
    return;
  }

  const allowedDivisionName = getDivisionNameByCode(user.divisionCode);

  if (!allowedDivisionName || divisionName !== allowedDivisionName) {
    throw new Error('You can only submit requests for your own division.');
  }
};

export const approvalService = {
  listRequests(user: DevUserMode) {
    return workforceRepository.listPendingChangeRequests(user);
  },

  getRequest(user: DevUserMode, requestId: string) {
    return workforceRepository.getChangeRequestById(user, requestId);
  },

  submitRequest(user: DevUserMode, rows: OrganizationApprovalChangeRow[]) {
    rows.forEach((row) => validateSubmissionPermission(user, row.divisionName));

    return workforceRepository.createPendingChangeRequest({
      submittedBy: user,
      type: 'organization',
      rows
    });
  },

  submitWorkforceTargetRequest(user: DevUserMode, rows: WorkforceTargetApprovalChangeRow[]) {
    rows.forEach((row) => validateSubmissionPermission(user, row.divisionName));

    return workforceRepository.createPendingChangeRequest({
      submittedBy: user,
      type: 'workforce-target',
      rows
    });
  },

  submitByType(user: DevUserMode, type: ApprovalRequestType, rows: ApprovalChangeRow[]) {
    if (type === 'workforce-target') {
      return this.submitWorkforceTargetRequest(user, rows as WorkforceTargetApprovalChangeRow[]);
    }

    return this.submitRequest(user, rows as OrganizationApprovalChangeRow[]);
  },

  buildChangeRows(user: DevUserMode, nextRows: OrganizationRecord[]) {
    const currentByCode = new Map(
      workforceRepository.getScopedOrganizations(user).map((record) => [record.org_code, record])
    );

    return nextRows.flatMap<OrganizationApprovalChangeRow>((row) => {
      const current = currentByCode.get(row.org_code);

      if (!current) {
        return [];
      }

      const changedFields = ORGANIZATION_APPROVAL_FIELDS.flatMap((field) =>
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
          key: row.org_code,
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

  buildWorkforceTargetChangeRows(user: DevUserMode, nextRows: WorkforceTargetRecord[]) {
    const currentByCode = new Map(
      workforceRepository.getScopedWorkforceTargets(user).map((record) => [record.org_code, record])
    );

    return nextRows.flatMap<WorkforceTargetApprovalChangeRow>((row) => {
      const current = currentByCode.get(row.org_code);

      if (!current) {
        return [];
      }

      const changedFields: Array<{ field: WorkforceTargetApprovalField; before: string; after: string }> = [];

      if (current.updated_date !== row.updated_date) {
        changedFields.push({
          field: 'updated_date',
          before: current.updated_date,
          after: row.updated_date
        });
      }

      organizationCategoryCodes.forEach((categoryCode) => {
        const currentHeadcount = Number(current.headcount_target_by_category[categoryCode] ?? 0);
        const nextHeadcount = Number(row.headcount_target_by_category[categoryCode] ?? 0);

        if (currentHeadcount !== nextHeadcount) {
          changedFields.push({
            field: `headcount_target_by_category.${categoryCode}`,
            before: String(currentHeadcount),
            after: String(nextHeadcount)
          });
        }

        const currentReallocation = Number(current.reallocation_target_by_category[categoryCode] ?? 0);
        const nextReallocation = Number(row.reallocation_target_by_category[categoryCode] ?? 0);

        if (currentReallocation !== nextReallocation) {
          changedFields.push({
            field: `reallocation_target_by_category.${categoryCode}`,
            before: String(currentReallocation),
            after: String(nextReallocation)
          });
        }
      });

      if (changedFields.length === 0) {
        return [];
      }

      return [
        {
          key: row.org_code,
          orgCode: row.org_code,
          orgName: row.org_name,
          divisionName: row.org_division_name,
          before: {
            ...current,
            headcount_target_by_category: { ...current.headcount_target_by_category },
            reallocation_target_by_category: { ...current.reallocation_target_by_category }
          },
          after: {
            ...row,
            headcount_target_by_category: { ...row.headcount_target_by_category },
            reallocation_target_by_category: { ...row.reallocation_target_by_category }
          },
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
