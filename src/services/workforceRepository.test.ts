import { getDivisionNameByCode, type DevUserMode } from '@features/auth/types/devUserMode';
import { workforceRepository } from '@services/workforceRepository';

const divisionUser: DevUserMode = {
  empNo: 17101001,
  name: 'Parker MX',
  nameEn: 'Parker MX',
  role: 'DIVISION_HR',
  divisionCode: 'C100001'
};

const adminUser: DevUserMode = {
  empNo: 17100209,
  name: 'Admin Lee',
  nameEn: 'Admin Lee',
  role: 'ADMIN',
  divisionCode: 'C100001'
};

const aeroUser: DevUserMode = {
  empNo: 17101007,
  name: 'Yoon Aero',
  nameEn: 'Yoon Aero',
  role: 'DIVISION_HR',
  divisionCode: 'C100401'
};

describe('workforceRepository', () => {
  beforeEach(() => {
    workforceRepository.resetForTests();
  });

  it('scopes organizations by division user', () => {
    const scopedOrganizations = workforceRepository.getScopedOrganizations(divisionUser);

    expect(scopedOrganizations.length).toBeGreaterThan(0);
    expect(scopedOrganizations.every((record) => record.org_division_name === getDivisionNameByCode(divisionUser.divisionCode))).toBe(true);
  });

  it('scopes organizations for newly added small divisions', () => {
    const scopedOrganizations = workforceRepository.getScopedOrganizations(aeroUser);

    expect(scopedOrganizations.length).toBeGreaterThan(0);
    expect(scopedOrganizations.every((record) => record.org_division_name === getDivisionNameByCode(aeroUser.divisionCode))).toBe(true);
  });

  it('reconciles stored repository state with the latest seed dataset', () => {
    const staleState = {
      organizations: workforceRepository
        .getEffectiveOrganizations()
        .filter((record) => record.org_division_name !== getDivisionNameByCode(aeroUser.divisionCode)),
      approvals: []
    };

    window.localStorage.setItem('enterprise-react-starter/workforce-repository/v1', JSON.stringify(staleState));
    workforceRepository.reloadFromStorageForTests();

    const scopedOrganizations = workforceRepository.getScopedOrganizations(aeroUser);

    expect(scopedOrganizations.length).toBeGreaterThan(0);
    expect(scopedOrganizations.some((record) => record.org_code === aeroUser.divisionCode)).toBe(true);
  });

  it('creates, approves, and applies pending change requests', () => {
    const targetRecord = workforceRepository.getScopedOrganizations(divisionUser)[0];

    const request = workforceRepository.createPendingChangeRequest({
      submittedBy: divisionUser,
      type: 'organization',
      rows: [
        {
          key: targetRecord.org_code,
          orgCode: targetRecord.org_code,
          orgName: `${targetRecord.org_department_name} Updated`,
          divisionName: targetRecord.org_division_name,
          before: { ...targetRecord },
          after: { ...targetRecord, org_department_name: `${targetRecord.org_department_name} Updated` },
          changedFields: [
            {
              field: 'org_department_name',
              before: targetRecord.org_department_name,
              after: `${targetRecord.org_department_name} Updated`
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
    expect(updatedRecord?.org_department_name).toBe(`${targetRecord.org_department_name} Updated`);
  });
});
