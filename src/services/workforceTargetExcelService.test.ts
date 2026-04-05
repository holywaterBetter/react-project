import type { DevUserMode } from '@features/auth/types/devUserMode';
import { organizationService } from '@services/organizationService';
import { workforceTargetExcelService } from '@services/workforceTargetExcelService';
import type { OrganizationRecord } from '@shared-types/org';
import * as XLSX from 'xlsx';

const divisionUser: DevUserMode = {
  empNo: 17101001,
  name: '박엠엑스',
  nameEn: 'Parker MX',
  role: 'DIVISION_HR',
  divisionCode: 'C100001'
};

const globalUser: DevUserMode = {
  empNo: 17100208,
  name: '김삼성',
  nameEn: 'Holywater',
  role: 'GLOBAL_HR',
  divisionCode: 'C100001'
};

const organizationRows: OrganizationRecord[] = [
  {
    org_code: 'C100001',
    org_name: 'MX 사업부',
    org_division_code: 'C10',
    org_division_name: 'MX 사업부',
    upper_org_code: 'C10',
    updated_date: '20260228',
    org_category_code: 'A1',
    org_category_name: 'A (주력)',
    org_division_name_en: 'MX Division',
    org_category_name_en: 'A (Core)',
    org_department_name: 'MX 사업부',
    org_department_name_en: 'MX Division'
  },
  {
    org_code: 'C100308',
    org_name: 'Aero 사업부',
    org_division_code: 'C40',
    org_division_name: 'Aero 사업부',
    upper_org_code: 'C40',
    updated_date: '20260228',
    org_category_code: 'A1',
    org_category_name: 'A (주력)',
    org_division_name_en: 'Aero Division',
    org_category_name_en: 'A (Core)',
    org_department_name: 'Aero 사업부',
    org_department_name_en: 'Aero Division'
  }
];

const createUploadFile = (rows: Record<string, string | number>[]) => {
  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: workforceTargetExcelService.requiredHeaders as string[]
  });
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, 'upload');

  const workbookOutput = XLSX.write(workbook, {
    type: 'array',
    bookType: 'xlsx'
  });

  return new File([workbookOutput], 'workforce-target-upload.xlsx');
};

describe('workforceTargetExcelService', () => {
  beforeEach(() => {
    jest.spyOn(organizationService, 'getEffectiveOrganizations').mockResolvedValue(organizationRows);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('validates required headers before row parsing', async () => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        기준월: '202604',
        사업부명: 'MX 사업부'
      }
    ]);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'upload');

    const workbookOutput = XLSX.write(workbook, {
      type: 'array',
      bookType: 'xlsx'
    });
    const file = new File([workbookOutput], 'invalid-upload.xlsx');

    await expect(workforceTargetExcelService.validateUpload(file, globalUser)).rejects.toThrow(
      'The uploaded file is missing required columns:'
    );
  });

  it('returns validation errors for base month and numeric cells', async () => {
    const file = createUploadFile([
      {
        기준월: '2026-04',
        사업부명: 'MX 사업부',
        사업부코드: 'C100001',
        조직코드: 'C100001',
        A1_target: 'a',
        B1_target: 2,
        B2_target: 3,
        B3_target: 4,
        C1_target: 5,
        A1_reallocation: 1,
        B1_reallocation: 2,
        B2_reallocation: 3,
        B3_reallocation: 4,
        C1_reallocation: 5
      }
    ]);

    const result = await workforceTargetExcelService.validateUpload(file, globalUser);

    expect(result.validRows).toHaveLength(0);
    expect(result.errors.some((error) => error.column === '기준월')).toBe(true);
    expect(result.errors.some((error) => error.column === 'A1_target')).toBe(true);
  });

  it('rejects rows outside DIVISION_HR scope', async () => {
    const file = createUploadFile([
      {
        기준월: '202604',
        사업부명: 'Aero 사업부',
        사업부코드: 'C100401',
        조직코드: 'C100308',
        A1_target: 1,
        B1_target: 2,
        B2_target: 3,
        B3_target: 4,
        C1_target: 5,
        A1_reallocation: 1,
        B1_reallocation: 2,
        B2_reallocation: 3,
        B3_reallocation: 4,
        C1_reallocation: 5
      }
    ]);

    const result = await workforceTargetExcelService.validateUpload(file, divisionUser);

    expect(result.validRows).toHaveLength(0);
    expect(result.errors.some((error) => error.message.includes('outside the current user scope'))).toBe(true);
  });

  it('maps valid rows into OrganizationDivisionCountRecord update dto', async () => {
    const file = createUploadFile([
      {
        기준월: '202604',
        사업부명: 'MX 사업부',
        사업부코드: 'C100001',
        조직코드: 'C100001',
        A1_target: 11,
        B1_target: 12,
        B2_target: 13,
        B3_target: 14,
        C1_target: 15,
        A1_reallocation: 1,
        B1_reallocation: 2,
        B2_reallocation: 3,
        B3_reallocation: 4,
        C1_reallocation: 5
      }
    ]);

    const result = await workforceTargetExcelService.validateUpload(file, divisionUser);

    expect(result.errors).toHaveLength(0);
    expect(result.validRows).toEqual([
      {
        org_code: 'C100001',
        updated_date: '202604',
        headcount_20261231_target_by_category: {
          A1: 11,
          B1: 12,
          B2: 13,
          B3: 14,
          C1: 15
        },
        reallocation_target_20261231_by_category: {
          A1: 1,
          B1: 2,
          B2: 3,
          B3: 4,
          C1: 5
        }
      }
    ]);
  });
});
