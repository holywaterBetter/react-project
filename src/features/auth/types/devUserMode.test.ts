import {
  DEV_USER_MODES,
  canApproveChanges,
  canSeeAllDivisions,
  getAllowedDivisionNames,
  getDevUserModeById
} from '@features/auth/types/devUserMode';

describe('dev user mode helpers', () => {
  it('grants all-division access to global roles only', () => {
    const globalUser = getDevUserModeById('global-hr');
    const adminUser = getDevUserModeById('admin');
    const divisionUser = DEV_USER_MODES.find((mode) => mode.role === 'DIVISION_HR');

    expect(canSeeAllDivisions(globalUser)).toBe(true);
    expect(canSeeAllDivisions(adminUser)).toBe(true);
    expect(canSeeAllDivisions(divisionUser!)).toBe(false);
    expect(getAllowedDivisionNames(divisionUser!)).toEqual([divisionUser!.divisionName]);
  });

  it('allows approvals for global hr and admin', () => {
    const globalUser = getDevUserModeById('global-hr');
    const adminUser = getDevUserModeById('admin');
    const divisionUser = DEV_USER_MODES.find((mode) => mode.role === 'DIVISION_HR');

    expect(canApproveChanges(globalUser)).toBe(true);
    expect(canApproveChanges(adminUser)).toBe(true);
    expect(canApproveChanges(divisionUser!)).toBe(false);
  });
});
