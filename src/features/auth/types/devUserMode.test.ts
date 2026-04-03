import {
  canApproveChanges,
  canSeeAllDivisions,
  getAllowedDivisionNames,
  getDivisionNameByCode,
  type DevUserMode
} from '@features/auth/types/devUserMode';

const globalUser: DevUserMode = {
  empNo: 17100208,
  name: '김삼성',
  nameEn: 'Holywater',
  role: 'GLOBAL_HR',
  divisionCode: 'C100001'
};

const adminUser: DevUserMode = {
  empNo: 17100209,
  name: '이관리',
  nameEn: 'Admin Lee',
  role: 'ADMIN',
  divisionCode: 'C100001'
};

const divisionUser: DevUserMode = {
  empNo: 17101001,
  name: '박엠엑스',
  nameEn: 'Parker MX',
  role: 'DIVISION_HR',
  divisionCode: 'C100001'
};

describe('dev user mode helpers', () => {
  it('grants all-division access to global roles only', () => {
    expect(canSeeAllDivisions(globalUser)).toBe(true);
    expect(canSeeAllDivisions(adminUser)).toBe(true);
    expect(canSeeAllDivisions(divisionUser)).toBe(false);
    expect(getAllowedDivisionNames(divisionUser)).toEqual([getDivisionNameByCode(divisionUser.divisionCode)]);
  });

  it('allows approvals for global hr and admin', () => {
    expect(canApproveChanges(globalUser)).toBe(true);
    expect(canApproveChanges(adminUser)).toBe(true);
    expect(canApproveChanges(divisionUser)).toBe(false);
  });
});
