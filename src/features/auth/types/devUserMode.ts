export type AppUserRole = 'GLOBAL_HR' | 'DIVISION_HR' | 'ADMIN';

export type RoleScope = {
  role: AppUserRole;
  divisionName: string | null;
  allDivisions: boolean;
};

export type ScopedQueryOptions = {
  search?: string;
  divisionName?: string;
  categoryCode?: string;
};

export type DevUserMode = {
  id: string;
  label: string;
  role: AppUserRole;
  divisionName: string | null;
};

export const DIVISION_NAMES = [
  'MX 사업부',
  'DS 사업부',
  'DX 사업부',
  'S/W 플랫폼 사업부',
  'Global 운영 사업부'
] as const;

export const DEV_USER_MODES: DevUserMode[] = [
  {
    id: 'global-hr',
    label: 'GLOBAL_HR',
    role: 'GLOBAL_HR',
    divisionName: null
  },
  {
    id: 'admin',
    label: 'ADMIN',
    role: 'ADMIN',
    divisionName: null
  },
  ...DIVISION_NAMES.map((divisionName) => ({
    id: `division-hr-${divisionName}`,
    label: `DIVISION_HR · ${divisionName}`,
    role: 'DIVISION_HR' as const,
    divisionName
  }))
];

export const DEFAULT_DEV_USER_MODE_ID = DEV_USER_MODES[0].id;

export const getRoleScope = (user: DevUserMode): RoleScope => ({
  role: user.role,
  divisionName: user.divisionName,
  allDivisions: user.role !== 'DIVISION_HR'
});

export const canSeeAllDivisions = (user: DevUserMode) => user.role !== 'DIVISION_HR';

export const canApproveChanges = (user: DevUserMode) => user.role === 'GLOBAL_HR' || user.role === 'ADMIN';

export const getAllowedDivisionNames = (user: DevUserMode) =>
  canSeeAllDivisions(user) ? [...DIVISION_NAMES] : user.divisionName ? [user.divisionName] : [];

export const getDevUserModeById = (id: string) =>
  DEV_USER_MODES.find((mode) => mode.id === id) ?? DEV_USER_MODES[0];
