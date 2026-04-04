import { organizationWorkforceDashboardApi } from '@api/organizationWorkforceDashboardApi';
import { getDivisionNameByCode, SMALL_DIVISION_GROUP, type DevUserMode } from '@features/auth/types/devUserMode';
import { approvalService } from '@services/approvalService';
import { workforceRepository } from '@services/workforceRepository';

const globalUser: DevUserMode = {
  empNo: 17100208,
  name: 'Holywater',
  nameEn: 'Holywater',
  role: 'GLOBAL_HR',
  divisionCode: 'C100001'
};

const aeroUser: DevUserMode = {
  empNo: 17101007,
  name: 'Yoon Aero',
  nameEn: 'Yoon Aero',
  role: 'DIVISION_HR',
  divisionCode: 'C100401'
};

describe('organizationWorkforceDashboardApi', () => {
  beforeEach(() => {
    workforceRepository.resetForTests();
  });

  it('returns division-only options for global users and groups small divisions into 기타 사업부', async () => {
    const metaResponse = await organizationWorkforceDashboardApi.getOrganizationWorkforceDashboardMeta(globalUser);

    expect(metaResponse.success).toBe(true);
    expect(metaResponse.data.organizationOptions).toContainEqual(
      expect.objectContaining({
        orgCode: SMALL_DIVISION_GROUP.code,
        orgName: SMALL_DIVISION_GROUP.name
      })
    );
    expect(metaResponse.data.organizationOptions.some((option) => option.orgName.includes('Energy 조직'))).toBe(false);
    expect(metaResponse.data.organizationOptions.some((option) => option.orgName.includes('Aero 조직'))).toBe(false);
  });

  it('returns only the aero division option for aero division hr users', async () => {
    const [metaResponse, listResponse] = await Promise.all([
      organizationWorkforceDashboardApi.getOrganizationWorkforceDashboardMeta(aeroUser),
      organizationWorkforceDashboardApi.getOrganizationWorkforceDashboardList(aeroUser)
    ]);

    expect(metaResponse.success).toBe(true);
    expect(listResponse.success).toBe(true);
    expect(metaResponse.data.organizationOptions).toEqual([
      {
        orgCode: aeroUser.divisionCode,
        orgName: getDivisionNameByCode(aeroUser.divisionCode),
        orgDisplayName: getDivisionNameByCode(aeroUser.divisionCode)
      }
    ]);
    expect(listResponse.data).toEqual([
      expect.objectContaining({
        orgCode: aeroUser.divisionCode,
        orgName: getDivisionNameByCode(aeroUser.divisionCode)
      })
    ]);
  });

  it('reflects approved workforce-target changes immediately in dashboard target metrics', async () => {
    const targetRow = workforceRepository.getScopedWorkforceTargets(aeroUser)[0];
    const changedRows = approvalService.buildWorkforceTargetChangeRows(aeroUser, [
      {
        ...targetRow,
        headcount_target_by_category: {
          ...targetRow.headcount_target_by_category,
          A1: Number(targetRow.headcount_target_by_category.A1 ?? 0) + 12
        }
      }
    ]);

    const request = approvalService.submitWorkforceTargetRequest(aeroUser, changedRows);

    expect(request?.type).toBe('workforce-target');

    approvalService.approveRequest(globalUser, request!.id, 'Approved target adjustment');

    const listResponse = await organizationWorkforceDashboardApi.getOrganizationWorkforceDashboardList(aeroUser);
    const updatedSection = listResponse.data.find((entry) => entry.orgCode === aeroUser.divisionCode);

    expect(updatedSection?.categoryMetrics.A1.target2026.headcount).toBe(
      Number(targetRow.headcount_target_by_category.A1 ?? 0) + 12
    );
  });
});
