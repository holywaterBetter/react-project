export const organizationCategoryMap = {
  A1: {
    code: 'A1',
    groupLabel: 'A',
    displayLabel: '주력',
    dashboardLabel: '전출부서(A)'
  },
  B1: {
    code: 'B1',
    groupLabel: 'B',
    displayLabel: 'AX',
    dashboardLabel: 'AX'
  },
  B2: {
    code: 'B2',
    groupLabel: 'B',
    displayLabel: '성장사업',
    dashboardLabel: '성장사업'
  },
  B3: {
    code: 'B3',
    groupLabel: 'B',
    displayLabel: '신사업',
    dashboardLabel: '신사업'
  },
  C1: {
    code: 'C1',
    groupLabel: 'C',
    displayLabel: '주력_고강도',
    dashboardLabel: '업무로드高'
  }
} as const;

export const organizationCategoryCodes = Object.keys(organizationCategoryMap) as OrganizationCategoryCode[];

export type OrganizationCategoryCode = keyof typeof organizationCategoryMap;
