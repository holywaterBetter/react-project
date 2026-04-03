import { organizationService } from '@services/organizationService';
import type {
  OrganizationCategorySummary,
  OrganizationRecord,
  OrganizationUploadResult,
  OrganizationUploadRow,
  OrganizationUploadValidationError
} from '@shared-types/org';
import * as XLSX from 'xlsx';

const EXPORT_HEADERS = ['기준년월', '사업부', '현부서', '현부서코드', '조직분류'] as const;
const REQUIRED_HEADERS = ['기준년월', '사업부', '현부서', '조직분류'] as const;
const CODE_HEADER_CANDIDATES = ['현부서코드', 'org_code'] as const;

const normalizeHeader = (value: unknown) => String(value ?? '').trim();
const normalizeCell = (value: unknown) => String(value ?? '').trim();

const toUploadRow = (row: Record<string, unknown>): OrganizationUploadRow => {
  const codeHeader = CODE_HEADER_CANDIDATES.find((candidate) => candidate in row) ?? '현부서코드';

  return {
    기준년월: normalizeCell(row['기준년월']),
    사업부: normalizeCell(row['사업부']),
    현부서: normalizeCell(row['현부서']),
    현부서코드: normalizeCell(row[codeHeader]),
    조직분류: normalizeCell(row['조직분류'])
  };
};

const readWorkbook = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  return XLSX.read(arrayBuffer, { type: 'array' });
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(objectUrl);
};

const buildCategoryLookup = (categories: OrganizationCategorySummary[]) =>
  categories.reduce<Map<string, string>>((accumulator, category) => {
    accumulator.set(category.categoryName, category.categoryCode);
    return accumulator;
  }, new Map());

export const excelService = {
  exportHeaders: [...EXPORT_HEADERS],

  exportOrganizations(records: OrganizationRecord[], fileName = 'organization-selection.xlsx') {
    const rows = records.map((record) => ({
      기준년월: record.updated_date,
      사업부: record.org_division_name,
      현부서: record.org_name,
      현부서코드: record.org_code,
      조직분류: record.org_category_name
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows, {
      header: [...EXPORT_HEADERS]
    });

    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 24 },
      { wch: 28 },
      { wch: 18 },
      { wch: 20 }
    ];
    worksheet['!autofilter'] = {
      ref: `A1:E${Math.max(rows.length + 1, 2)}`
    };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Organization Selection');

    const workbookOutput = XLSX.write(workbook, {
      type: 'array',
      bookType: 'xlsx'
    });

    downloadBlob(
      new Blob([workbookOutput], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }),
      fileName
    );
  },

  async validateUpload(file: File): Promise<OrganizationUploadResult> {
    const workbook = await readWorkbook(file);
    const [sheetName] = workbook.SheetNames;

    if (!sheetName) {
      throw new Error('업로드할 시트를 찾을 수 없습니다.');
    }

    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: '',
      raw: false
    });
    const headerRow = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
      header: 1,
      range: 0,
      blankrows: false
    })[0] ?? [];
    const normalizedHeaders = headerRow.map(normalizeHeader);
    const missingHeaders = [
      ...REQUIRED_HEADERS.filter((header) => !normalizedHeaders.includes(header)),
      ...(CODE_HEADER_CANDIDATES.some((header) => normalizedHeaders.includes(header)) ? [] : ['현부서코드'])
    ];

    if (missingHeaders.length > 0) {
      throw new Error(`필수 컬럼이 누락되었습니다: ${missingHeaders.join(', ')}`);
    }

    const categories = await organizationService.getOrganizationCategories();
    const categoryLookup = buildCategoryLookup(categories);

    const uniqueCodes = [...new Set(rows.map((row) => toUploadRow(row).현부서코드).filter(Boolean))];
    const organizationResults = await Promise.all(
      uniqueCodes.map(async (orgCode) => [orgCode, await organizationService.getOrganizationByCode(orgCode)] as const)
    );
    const organizationLookup = new Map(organizationResults);

    const validRows: OrganizationRecord[] = [];
    const errors: OrganizationUploadValidationError[] = [];

    rows.forEach((rawRow, index) => {
      const rowNumber = index + 2;
      const row = toUploadRow(rawRow);

      if (!row.기준년월) {
        errors.push({
          rowNumber,
          column: '기준년월',
          message: '기준년월 값이 비어 있습니다.'
        });
      }

      if (!row.사업부) {
        errors.push({
          rowNumber,
          column: '사업부',
          message: '사업부 값이 비어 있습니다.'
        });
      }

      if (!row.현부서) {
        errors.push({
          rowNumber,
          column: '현부서',
          message: '현부서 값이 비어 있습니다.'
        });
      }

      if (!row.현부서코드) {
        errors.push({
          rowNumber,
          column: '현부서코드',
          message: '현부서코드 값이 비어 있습니다.'
        });
      }

      if (!row.조직분류) {
        errors.push({
          rowNumber,
          column: '조직분류',
          message: '조직분류 값이 비어 있습니다.'
        });
      }

      if (!row.현부서코드 || !row.조직분류 || !row.기준년월 || !row.사업부 || !row.현부서) {
        return;
      }

      const organization = organizationLookup.get(row.현부서코드) ?? null;

      if (!organization) {
        errors.push({
          rowNumber,
          column: '현부서코드',
          message: '유효하지 않은 조직코드입니다.',
          value: row.현부서코드
        });
        return;
      }

      const categoryCode = categoryLookup.get(row.조직분류);

      if (!categoryCode) {
        errors.push({
          rowNumber,
          column: '조직분류',
          message: '허용되지 않은 조직분류입니다.',
          value: row.조직분류
        });
        return;
      }

      validRows.push({
        ...organization,
        updated_date: row.기준년월,
        org_division_name: row.사업부,
        org_name: row.현부서,
        org_category_code: categoryCode,
        org_category_name: row.조직분류
      });
    });

    return {
      validRows,
      errors,
      totalRows: rows.length
    };
  }
};
