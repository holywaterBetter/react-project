import { getAllowedDivisionNames, type DevUserMode } from '@features/auth/types/devUserMode';
import { organizationService } from '@services/organizationService';
import type {
  OrganizationRecord,
  OrganizationUploadResult,
  OrganizationUploadRow,
  OrganizationUploadValidationError
} from '@shared-types/org';
import * as XLSX from 'xlsx';

const EXPORT_HEADERS = ['Base Month', 'Division', 'Organization Name', 'Organization Code', 'Category'] as const;

const HEADER_LABELS = {
  baseMonth: 'Base Month',
  divisionName: 'Division',
  organizationName: 'Organization Name',
  organizationCode: 'Organization Code',
  categoryName: 'Category'
} as const;

const normalizeCell = (value: unknown) => String(value ?? '').trim();

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

const toUploadRow = (row: Record<string, unknown>): OrganizationUploadRow => ({
  baseMonth: normalizeCell(row[HEADER_LABELS.baseMonth]),
  divisionName: normalizeCell(row[HEADER_LABELS.divisionName]),
  organizationName: normalizeCell(row[HEADER_LABELS.organizationName]),
  organizationCode: normalizeCell(row[HEADER_LABELS.organizationCode]),
  categoryName: normalizeCell(row[HEADER_LABELS.categoryName])
});

const pushRequiredError = (
  errors: OrganizationUploadValidationError[],
  rowNumber: number,
  column: string,
  value: string
) => {
  if (!value) {
    errors.push({
      rowNumber,
      column,
      message: `${column} is required.`
    });
  }
};

export const excelService = {
  exportHeaders: [...EXPORT_HEADERS],

  exportOrganizations(records: OrganizationRecord[], fileName = 'organization-selection.xlsx') {
    const rows = records.map((record) => ({
      [HEADER_LABELS.baseMonth]: record.updated_date,
      [HEADER_LABELS.divisionName]: record.org_division_name,
      [HEADER_LABELS.organizationName]: record.org_name,
      [HEADER_LABELS.organizationCode]: record.org_code,
      [HEADER_LABELS.categoryName]: record.org_category_name
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows, {
      header: [...EXPORT_HEADERS]
    });

    worksheet['!cols'] = [
      { wch: 14 },
      { wch: 24 },
      { wch: 28 },
      { wch: 20 },
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

  async validateUpload(file: File, user: DevUserMode): Promise<OrganizationUploadResult> {
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
    const missingHeaders = EXPORT_HEADERS.filter((header) => !normalizedHeaders.includes(header));

    if (missingHeaders.length > 0) {
      throw new Error(`The uploaded file is missing required columns: ${missingHeaders.join(', ')}`);
    }

    if (rows.length === 0) {
      throw new Error('The uploaded file does not contain any data rows.');
    }

    const allOrganizations = await organizationService.getEffectiveOrganizations();
    const organizationByCode = new Map(allOrganizations.map((record) => [record.org_code, record]));
    const categoryByName = new Map(allOrganizations.map((record) => [record.org_category_name, record.org_category_code]));
    const allowedDivisions = new Set(getAllowedDivisionNames(user));

    const validRows: OrganizationRecord[] = [];
    const errors: OrganizationUploadValidationError[] = [];

    rows.forEach((rawRow, index) => {
      const rowNumber = index + 2;
      const row = toUploadRow(rawRow);

      pushRequiredError(errors, rowNumber, HEADER_LABELS.baseMonth, row.baseMonth);
      pushRequiredError(errors, rowNumber, HEADER_LABELS.divisionName, row.divisionName);
      pushRequiredError(errors, rowNumber, HEADER_LABELS.organizationName, row.organizationName);
      pushRequiredError(errors, rowNumber, HEADER_LABELS.organizationCode, row.organizationCode);
      pushRequiredError(errors, rowNumber, HEADER_LABELS.categoryName, row.categoryName);

      if (
        !row.baseMonth ||
        !row.divisionName ||
        !row.organizationName ||
        !row.organizationCode ||
        !row.categoryName
      ) {
        return;
      }

      const organization = organizationByCode.get(row.organizationCode);

      if (!organization) {
        errors.push({
          rowNumber,
          column: HEADER_LABELS.organizationCode,
          message: 'Organization code was not found in the mock dataset.',
          value: row.organizationCode
        });
        return;
      }

      if (!allowedDivisions.has(row.divisionName)) {
        errors.push({
          rowNumber,
          column: HEADER_LABELS.divisionName,
          message: 'This division is outside the current user scope.',
          value: row.divisionName
        });
        return;
      }

      if (organization.org_division_name !== row.divisionName) {
        errors.push({
          rowNumber,
          column: HEADER_LABELS.divisionName,
          message: 'Division does not match the organization code.',
          value: row.divisionName
        });
        return;
      }

      const categoryCode = categoryByName.get(row.categoryName);

      if (!categoryCode) {
        errors.push({
          rowNumber,
          column: HEADER_LABELS.categoryName,
          message: 'Category is not recognized.',
          value: row.categoryName
        });
        return;
      }

      validRows.push({
        ...organization,
        updated_date: row.baseMonth,
        org_name: row.organizationName,
        org_category_code: categoryCode,
        org_category_name: row.categoryName
      });
    });

    return {
      validRows,
      errors,
      totalRows: rows.length
    };
  }
};
