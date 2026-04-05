import type { DashboardTableRow, DashboardTableSection } from '@pages/organization-workforce-dashboard/types/organizationWorkforceDashboard';
import {
  buildOrganizationWorkforceDashboardExportModel,
  type OrganizationWorkforceDashboardExportFilters
} from '@pages/organization-workforce-dashboard/utils/exportMappers';
import * as XLSX from 'xlsx';

type ExportOrganizationWorkforceDashboardExcelParams = {
  exportedAt?: Date;
  filters: OrganizationWorkforceDashboardExportFilters;
  sections: DashboardTableSection[];
};

const thinBorder = {
  bottom: { color: { rgb: 'D1D5DB' }, style: 'thin' },
  left: { color: { rgb: 'D1D5DB' }, style: 'thin' },
  right: { color: { rgb: 'D1D5DB' }, style: 'thin' },
  top: { color: { rgb: 'D1D5DB' }, style: 'thin' }
};

const styleCell = (worksheet: XLSX.WorkSheet, rowIndex: number, columnIndex: number, style: XLSX.CellObject['s']) => {
  const cellAddress = XLSX.utils.encode_cell({ c: columnIndex, r: rowIndex });
  const cell = worksheet[cellAddress];

  if (!cell) {
    return;
  }

  cell.s = style;
};

const getDataFillColor = (tone?: DashboardTableRow['tone']) => {
  if (tone === 'total') {
    return 'E8F1FB';
  }

  if (tone === 'summary') {
    return 'F6F8FB';
  }

  if (tone === 'group') {
    return 'EEF2F7';
  }

  return 'FFFFFF';
};

const getDeltaFontColor = (value: string) => {
  if (value.startsWith('+')) {
    return 'C2410C';
  }

  if (value.startsWith('-')) {
    return '1D4ED8';
  }

  return '111827';
};

export const exportOrganizationWorkforceDashboardExcel = ({
  exportedAt,
  filters,
  sections
}: ExportOrganizationWorkforceDashboardExcelParams) => {
  if (sections.length === 0) {
    throw new Error('내보낼 대시보드 데이터가 없습니다.');
  }

  const workbook = XLSX.utils.book_new();
  const model = buildOrganizationWorkforceDashboardExportModel({
    exportedAt,
    filters,
    sections
  });
  const worksheet = XLSX.utils.aoa_to_sheet(model.rows.map((row) => row.values));

  worksheet['!cols'] = model.columns;
  worksheet['!merges'] = model.merges;
  worksheet['!rows'] = model.rowHeights;

  model.rows.forEach((row, rowIndex) => {
    if (row.kind === 'spacer') {
      return;
    }

    if (row.kind === 'title') {
      for (let columnIndex = 0; columnIndex < row.values.length; columnIndex += 1) {
        styleCell(worksheet, rowIndex, columnIndex, {
          alignment: { horizontal: 'center', vertical: 'center' },
          border: thinBorder,
          fill: { fgColor: { rgb: 'E2E8F0' }, patternType: 'solid' },
          font: { bold: true, sz: 15 }
        });
      }

      return;
    }

    if (row.kind === 'meta') {
      styleCell(worksheet, rowIndex, 0, {
        alignment: { vertical: 'center' },
        border: thinBorder,
        fill: { fgColor: { rgb: 'F8FAFC' }, patternType: 'solid' },
        font: { bold: true }
      });

      for (let columnIndex = 1; columnIndex < row.values.length; columnIndex += 1) {
        styleCell(worksheet, rowIndex, columnIndex, {
          alignment: { vertical: 'center' },
          border: thinBorder
        });
      }

      return;
    }

    if (row.kind === 'headerGroup' || row.kind === 'headerSub') {
      for (let columnIndex = 0; columnIndex < row.values.length; columnIndex += 1) {
        styleCell(worksheet, rowIndex, columnIndex, {
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: thinBorder,
          fill: { fgColor: { rgb: row.kind === 'headerGroup' ? 'DCE6F1' : 'EDF2F7' }, patternType: 'solid' },
          font: { bold: true }
        });
      }

      return;
    }

    const fillColor = getDataFillColor(row.tone);

    styleCell(worksheet, rowIndex, 0, {
      alignment: { horizontal: 'left', vertical: 'center' },
      border: thinBorder,
      fill: { fgColor: { rgb: 'F8FAFC' }, patternType: 'solid' },
      font: { bold: true }
    });

    styleCell(worksheet, rowIndex, 1, {
      alignment: { horizontal: 'center', vertical: 'center' },
      border: thinBorder,
      fill: { fgColor: { rgb: 'F8FAFC' }, patternType: 'solid' },
      font: { bold: true }
    });

    styleCell(worksheet, rowIndex, 2, {
      alignment: { horizontal: 'left', indent: row.level ?? 0, vertical: 'center' },
      border: thinBorder,
      fill: { fgColor: { rgb: fillColor }, patternType: 'solid' },
      font: { bold: row.tone === 'detail' ? false : true }
    });

    for (let columnIndex = 3; columnIndex < row.values.length; columnIndex += 1) {
      const cellValue = String(row.values[columnIndex] ?? '');

      styleCell(worksheet, rowIndex, columnIndex, {
        alignment: { horizontal: 'right', vertical: 'center' },
        border: thinBorder,
        fill: { fgColor: { rgb: fillColor }, patternType: 'solid' },
        font:
          columnIndex === 8 || columnIndex === 12
            ? { bold: true, color: { rgb: getDeltaFontColor(cellValue) } }
            : { bold: row.tone === 'total' }
      });
    }
  });

  workbook.Props = {
    CreatedDate: exportedAt ?? new Date(),
    Subject: '조직별 인력현황 및 재배치 실적 대시보드',
    Title: '조직별 인력현황 및 재배치 실적 대시보드(안)'
  };

  XLSX.utils.book_append_sheet(workbook, worksheet, model.sheetName);
  XLSX.writeFile(workbook, model.fileName, {
    bookType: 'xlsx',
    cellStyles: true,
    compression: true
  });
};
