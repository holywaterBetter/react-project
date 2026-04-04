import { organizationWorkforceDashboardApi } from '@api/organizationWorkforceDashboardApi';
import { getDivisionNameByCode, SMALL_DIVISION_GROUP, type DevUserMode } from '@features/auth/types/devUserMode';

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
  it('returns division-only options for global users and groups small divisions into 기타 사업부', async () => {
    const [metaResponse, listResponse] = await Promise.all([
      organizationWorkforceDashboardApi.getOrganizationWorkforceDashboardMeta(globalUser),
      organizationWorkforceDashboardApi.getOrganizationWorkforceDashboardList(globalUser)
    ]);

    expect(metaResponse.success).toBe(true);
    expect(listResponse.success).toBe(true);
    expect(metaResponse.data.organizationOptions).toContainEqual(
      expect.objectContaining({
        orgCode: SMALL_DIVISION_GROUP.code,
        orgName: SMALL_DIVISION_GROUP.name
      })
    );
    expect(metaResponse.data.organizationOptions.some((option) => option.orgName.includes('Energy 조직'))).toBe(false);
    expect(metaResponse.data.organizationOptions.some((option) => option.orgName.includes('Aero 조직'))).toBe(false);
    expect(metaResponse.data.organizationOptions.at(-1)).toEqual(
      expect.objectContaining({
        orgCode: SMALL_DIVISION_GROUP.code,
        orgDisplayName: SMALL_DIVISION_GROUP.name
      })
    );
    expect(listResponse.data.at(-1)).toEqual(
      expect.objectContaining({
        orgCode: SMALL_DIVISION_GROUP.code,
        orgDisplayName: SMALL_DIVISION_GROUP.name
      })
    );
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
});
