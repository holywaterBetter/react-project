import { getDevUserModeById } from '@features/auth/types/devUserMode';
import { workforceRepository } from '@services/workforceRepository';

describe('workforceRepository', () => {
  beforeEach(() => {
    workforceRepository.resetForTests();
  });

  it('scopes organizations by division user', () => {
    const divisionUser = getDevUserModeById('division-hr-MX 사업부');
    const scopedOrganizations = workforceRepository.getScopedOrganizations(divisionUser);

    expect(scopedOrganizations.length).toBeGreaterThan(0);
    expect(scopedOrganizations.every((record) => record.org_division_name === 'MX 사업부')).toBe(true);
  });

  it('creates, approves, and applies pending change requests', () => {
    const divisionUser = getDevUserModeById('division-hr-MX 사업부');
    const adminUser = getDevUserModeById('admin');
    const targetRecord = workforceRepository.getScopedOrganizations(divisionUser)[0];

    const request = workforceRepository.createPendingChangeRequest({
      submittedBy: divisionUser,
      rows: [
        {
          orgCode: targetRecord.org_code,
          orgName: `${targetRecord.org_name} Updated`,
          divisionName: targetRecord.org_division_name,
          before: { ...targetRecord },
          after: { ...targetRecord, org_name: `${targetRecord.org_name} Updated` },
          changedFields: [
            {
              field: 'org_name',
              before: targetRecord.org_name,
              after: `${targetRecord.org_name} Updated`
            }
          ]
        }
      ]
    });

    expect(request).not.toBeNull();
    expect(workforceRepository.listPendingChangeRequests(divisionUser)).toHaveLength(1);

    const approved = workforceRepository.applyApprovedChanges(request!.id, adminUser, 'Looks good');
    const updatedRecord = workforceRepository
      .getScopedOrganizations(divisionUser)
      .find((record) => record.org_code === targetRecord.org_code);

    expect(approved?.status).toBe('approved');
    expect(updatedRecord?.org_name).toBe(`${targetRecord.org_name} Updated`);
  });

  it('re-hydrates persisted state from localStorage', () => {
    const divisionUser = getDevUserModeById('division-hr-MX 사업부');
    const targetRecord = workforceRepository.getScopedOrganizations(divisionUser)[0];

    workforceRepository.applyOrganizationRows([{ ...targetRecord, org_name: 'Persisted Name' }]);
    workforceRepository.reloadFromStorageForTests();

    const persistedRecord = workforceRepository
      .getScopedOrganizations(divisionUser)
      .find((record) => record.org_code === targetRecord.org_code);

    expect(persistedRecord?.org_name).toBe('Persisted Name');
  });
});
