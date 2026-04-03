export type AppUserRole = 'GLOBAL_HR' | 'DIVISION_HR' | 'ADMIN';

export type RoleScope = {
  role: AppUserRole;
  divisionCode: string | null;
  allDivisions: boolean;
};

export type ScopedQueryOptions = {
  search?: string;
  divisionCode?: string;
  categoryCode?: string;
};

export type DevUserMode = {
  empNo: number;
  name: string;
  nameEn: string;
  role: AppUserRole;
  divisionCode: string;
};

export type DivisionInfo = {
  code: string;
  name: string;
  nameEn: string;
};

export const SMALL_DIVISION_CODES = ['C100301', 'C100401', 'C100501', 'C100601', 'C100701'] as const;

export const SMALL_DIVISION_GROUP = {
  code: 'DIVISION_GROUP_ETC',
  name: '기타 사업부',
  nameEn: 'Other Divisions'
} as const;

export const DIVISION_INFOS: DivisionInfo[] = [
  { code: 'C100001', name: 'MX 사업부', nameEn: 'MX Division' },
  { code: 'C100061', name: 'DS 사업부', nameEn: 'DS Division' },
  { code: 'C100121', name: 'DX 사업부', nameEn: 'DX Division' },
  { code: 'C100181', name: 'S/W 플랫폼 사업부', nameEn: 'S/W Platform Division' },
  { code: 'C100241', name: 'Global 운영 사업부', nameEn: 'Global Operations Division' },
  { code: 'C100301', name: 'Bio 사업부', nameEn: 'Bio Division' },
  { code: 'C100401', name: 'Aero 사업부', nameEn: 'Aero Division' },
  { code: 'C100501', name: 'Energy 사업부', nameEn: 'Energy Division' },
  { code: 'C100601', name: 'RetailTech 사업부', nameEn: 'RetailTech Division' },
  { code: 'C100701', name: 'Mobility 서비스 사업부', nameEn: 'Mobility Service Division' }
];

export const DIVISION_NAME_BY_CODE = new Map(DIVISION_INFOS.map((division) => [division.code, division.name]));

export const DIVISION_NAME_EN_BY_CODE = new Map(DIVISION_INFOS.map((division) => [division.code, division.nameEn]));

export const getDivisionNameByCode = (divisionCode: string | null | undefined) =>
  (divisionCode ? DIVISION_NAME_BY_CODE.get(divisionCode) : null) ?? null;

export const getDivisionNameEnByCode = (divisionCode: string | null | undefined) =>
  (divisionCode ? DIVISION_NAME_EN_BY_CODE.get(divisionCode) : null) ?? null;

export const isSmallDivisionCode = (divisionCode: string) =>
  SMALL_DIVISION_CODES.includes(divisionCode as (typeof SMALL_DIVISION_CODES)[number]);

export const getRoleScope = (user: DevUserMode): RoleScope => ({
  role: user.role,
  divisionCode: user.role === 'DIVISION_HR' ? user.divisionCode : null,
  allDivisions: user.role !== 'DIVISION_HR'
});

export const canSeeAllDivisions = (user: DevUserMode) => user.role !== 'DIVISION_HR';

export const canApproveChanges = (user: DevUserMode) => user.role === 'GLOBAL_HR' || user.role === 'ADMIN';

export const getAllowedDivisionNames = (user: DevUserMode) => {
  if (canSeeAllDivisions(user)) {
    return DIVISION_INFOS.map((division) => division.name);
  }

  const divisionName = getDivisionNameByCode(user.divisionCode);
  return divisionName ? [divisionName] : [];
};
