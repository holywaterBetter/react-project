import { getAllowedDivisionNames, type DevUserMode } from '@features/auth/types/devUserMode';
import { organizationService } from '@services/organizationService';
import type {
  OrganizationUploadValidationError,
  WorkforceTargetUploadDto,
  WorkforceTargetUploadResult,
  WorkforceTargetUploadRow
} from '@shared-types/org';
import type { OrganizationCategoryCode } from '@constants/organizationCategoryMap';
import * as XLSX from 'xlsx';

const TARGET_DATE_KEY = '20261231' as const;

const HEADER_LABELS = {
  baseMonth: '기준월',
  divisionName: '사업부명',
  divisionCode: '사업부코드',
  organizationCode: '조직코드'
} as const;

const CATEGORY_CODES: OrganizationCategoryCode[] = ['A1', 'B1', 'B2', 'B3', 'C1'];

const TARGET_HEADERS = CATEGORY_CODES.map((categoryCode) => `${categoryCode}_target`) as readonly string[];
const REALLOCATION_HEADERS = CATEGORY_CODES.map((categoryCode) => `${categoryCode}_reallocation`) as readonly string[];

const REQUIRED_HEADERS = [
  HEADER_LABELS.baseMonth,
  HEADER_LABELS.divisionName,
  HEADER_LABELS.divisionCode,
  HEADER_LABELS.organizationCode,
  ...TARGET_HEADERS,
  ...REALLOCATION_HEADERS
] as const;

const normalizeCell = (value: unknown) => String(value ?? '').trim();

const readWorkbook = async (file: File) => {
  const arrayBuffer =
    typeof file.arrayBuffer === 'function'
      ? await file.arrayBuffer()
      : await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(file);
        });

  return XLSX.read(arrayBuffer, { type: 'array' });
};

const pushError = (
  errors: OrganizationUploadValidationError[],
  rowNumber: number,
  column: string,
  message: string,
  value?: string
) => {
  errors.push({ rowNumber, column, message, value });
};

const parseNumericCell = (
  errors: OrganizationUploadValidationError[],
  rowNumber: number,
  column: string,
  rawValue: string
) => {
  if (!rawValue) {
    pushError(errors, rowNumber, column, `${column} is required.`);
    return null;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue)) {
    pushError(errors, rowNumber, column, `${column} must be a valid number.`, rawValue);
    return null;
  }

  return parsedValue;
};

const toUploadRow = (row: Record<string, unknown>): WorkforceTargetUploadRow => {
  const targetByCategory = Object.fromEntries(
    CATEGORY_CODES.map((categoryCode) => [categoryCode, normalizeCell(row[`${categoryCode}_target`])])
  ) as WorkforceTargetUploadRow['targetByCategory'];

  const reallocationByCategory = Object.fromEntries(
    CATEGORY_CODES.map((categoryCode) => [categoryCode, normalizeCell(row[`${categoryCode}_reallocation`])])
  ) as WorkforceTargetUploadRow['reallocationByCategory'];

  return {
    baseMonth: normalizeCell(row[HEADER_LABELS.baseMonth]),
    divisionName: normalizeCell(row[HEADER_LABELS.divisionName]),
    divisionCode: normalizeCell(row[HEADER_LABELS.divisionCode]),
    organizationCode: normalizeCell(row[HEADER_LABELS.organizationCode]),
    targetByCategory,
    reallocationByCategory
  };
};

const isValidBaseMonth = (value: string) => /^\d{6}$/.test(value);

const isValidOrganizationCode = (value: string) => /^C\d{6}$/.test(value);

export const workforceTargetExcelService = {
  requiredHeaders: [...REQUIRED_HEADERS],

  async validateUpload(file: File, user: DevUserMode): Promise<WorkforceTargetUploadResult> {
    const workbook = await readWorkbook(file);
    const [sheetName] = workbook.SheetNames;

    if (!sheetName) {
      throw new Error('The uploaded workbook does not contain a sheet.');
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

    const normalizedHeaders = headerRow.map((header) => normalizeCell(header));
    const missingHeaders = REQUIRED_HEADERS.filter((header) => !normalizedHeaders.includes(header));

    if (missingHeaders.length > 0) {
      throw new Error(`The uploaded file is missing required columns: ${missingHeaders.join(', ')}`);
    }

    if (rows.length === 0) {
      throw new Error('The uploaded file does not contain any data rows.');
    }

    const allOrganizations = await organizationService.getEffectiveOrganizations();
    const organizationByCode = new Map(allOrganizations.map((record) => [record.org_code, record]));
    const allowedDivisions = new Set(getAllowedDivisionNames(user));

    const validRows: WorkforceTargetUploadDto[] = [];
    const errors: OrganizationUploadValidationError[] = [];

    rows.forEach((rawRow, index) => {
      const rowNumber = index + 2;
      const row = toUploadRow(rawRow);

      if (!row.baseMonth) {
        pushError(errors, rowNumber, HEADER_LABELS.baseMonth, `${HEADER_LABELS.baseMonth} is required.`);
      } else if (!isValidBaseMonth(row.baseMonth)) {
        pushError(errors, rowNumber, HEADER_LABELS.baseMonth, `${HEADER_LABELS.baseMonth} must be in YYYYMM format.`, row.baseMonth);
      }

      if (!row.divisionName) {
        pushError(errors, rowNumber, HEADER_LABELS.divisionName, `${HEADER_LABELS.divisionName} is required.`);
      }

      if (!row.divisionCode) {
        pushError(errors, rowNumber, HEADER_LABELS.divisionCode, `${HEADER_LABELS.divisionCode} is required.`);
      } else if (!isValidOrganizationCode(row.divisionCode)) {
        pushError(errors, rowNumber, HEADER_LABELS.divisionCode, `${HEADER_LABELS.divisionCode} format is invalid.`, row.divisionCode);
      }

      if (!row.organizationCode) {
        pushError(errors, rowNumber, HEADER_LABELS.organizationCode, `${HEADER_LABELS.organizationCode} is required.`);
      } else if (!isValidOrganizationCode(row.organizationCode)) {
        pushError(errors, rowNumber, HEADER_LABELS.organizationCode, `${HEADER_LABELS.organizationCode} format is invalid.`, row.organizationCode);
      }

      const targetByCategory = {} as WorkforceTargetUploadDto['headcount_20261231_target_by_category'];
      const reallocationByCategory = {} as WorkforceTargetUploadDto['reallocation_target_20261231_by_category'];

      CATEGORY_CODES.forEach((categoryCode) => {
        const targetHeader = `${categoryCode}_target`;
        const reallocationHeader = `${categoryCode}_reallocation`;

        const targetValue = parseNumericCell(errors, rowNumber, targetHeader, row.targetByCategory[categoryCode]);
        const reallocationValue = parseNumericCell(
          errors,
          rowNumber,
          reallocationHeader,
          row.reallocationByCategory[categoryCode]
        );

        if (targetValue !== null) {
          targetByCategory[categoryCode] = targetValue;
        }

        if (reallocationValue !== null) {
          reallocationByCategory[categoryCode] = reallocationValue;
        }
      });

      if (errors.some((error) => error.rowNumber === rowNumber)) {
        return;
      }

      const organization = organizationByCode.get(row.organizationCode);

      if (!organization) {
        pushError(
          errors,
          rowNumber,
          HEADER_LABELS.organizationCode,
          'Organization code was not found in the dataset.',
          row.organizationCode
        );
        return;
      }

      if (organization.org_division_name !== row.divisionName) {
        pushError(
          errors,
          rowNumber,
          HEADER_LABELS.divisionName,
          'Division name does not match the organization code.',
          row.divisionName
        );
        return;
      }

      if (user.role === 'DIVISION_HR') {
        const allowedByDivisionName = allowedDivisions.has(row.divisionName);
        const allowedByOrgCode = allowedDivisions.has(organization.org_division_name);

        if (!allowedByDivisionName && !allowedByOrgCode) {
          pushError(
            errors,
            rowNumber,
            HEADER_LABELS.divisionName,
            'This division is outside the current user scope.',
            row.divisionName
          );
          return;
        }
      }

      validRows.push({
        org_code: organization.org_code,
        updated_date: row.baseMonth,
        [`headcount_${TARGET_DATE_KEY}_target_by_category`]: targetByCategory,
        [`reallocation_target_${TARGET_DATE_KEY}_by_category`]: reallocationByCategory
      });
    });

    return {
      validRows,
      errors,
      totalRows: rows.length
    };
  }
};
