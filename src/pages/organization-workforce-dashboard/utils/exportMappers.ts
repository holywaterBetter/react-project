import type {
  DashboardTableRow,
  DashboardTableSection
} from '@pages/organization-workforce-dashboard/types/organizationWorkforceDashboard';
import {
  formatDateLabel,
  formatHeadcount,
  formatPercent,
  formatSignedHeadcount
} from '@pages/organization-workforce-dashboard/utils/dashboardFormatters';
import type { ColInfo, Range, RowInfo } from 'xlsx';

const REPORT_TITLE = '조직별 인력현황 및 재배치 실적 대시보드(안)';
const REPORT_FILE_PREFIX = '조직별_인력현황_및_재배치_실적_대시보드';
const SHEET_NAME = '조직별 인력현황';
const TOTAL_COLUMN_COUNT = 13;

type ExportCellValue = string | number;

export type OrganizationWorkforceDashboardExportFilters = {
  baseMonth?: string;
  keyword?: string;
  selectedOrgName?: string | null;
  snapshotMonth?: string;
};

export type OrganizationWorkforceDashboardExportRow = {
  kind: 'title' | 'meta' | 'spacer' | 'headerGroup' | 'headerSub' | 'data';
  level?: number;
  tone?: DashboardTableRow['tone'];
  values: ExportCellValue[];
};

export type OrganizationWorkforceDashboardExportModel = {
  columns: ColInfo[];
  fileName: string;
  merges: Range[];
  rowHeights: RowInfo[];
  rows: OrganizationWorkforceDashboardExportRow[];
  sheetName: string;
};

type BuildOrganizationWorkforceDashboardExportModelParams = {
  exportedAt?: Date;
  filters: OrganizationWorkforceDashboardExportFilters;
  sections: DashboardTableSection[];
};

const buildBlankRow = () => Array.from({ length: TOTAL_COLUMN_COUNT }, () => '');

const buildMergedValueRow = (label: string, value: string): ExportCellValue[] => {
  const row = buildBlankRow();

  row[0] = label;
  row[1] = value;

  return row;
};

const pad = (value: number) => String(value).padStart(2, '0');

const formatDisplayTimestamp = (value: Date) =>
  `${value.getFullYear()}.${pad(value.getMonth() + 1)}.${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}`;

const formatFileTimestamp = (value: Date) =>
  `${value.getFullYear()}${pad(value.getMonth() + 1)}${pad(value.getDate())}_${pad(value.getHours())}${pad(value.getMinutes())}`;

const sanitizeFileNameSegment = (value: string) =>
  value
    .trim()
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 24);

const buildFileName = (selectedOrgName: string | null | undefined, exportedAt: Date) => {
  const orgSegment = selectedOrgName ? `_${sanitizeFileNameSegment(selectedOrgName)}` : '';
  return `${REPORT_FILE_PREFIX}${orgSegment}_${formatFileTimestamp(exportedAt)}.xlsx`;
};

const formatKeyword = (keyword?: string) => {
  const trimmedKeyword = keyword?.trim();
  return trimmedKeyword ? trimmedKeyword : '없음';
};

const formatOrganizationFilter = (selectedOrgName?: string | null) => selectedOrgName ?? '전체 조직';

const formatExportScope = (sections: DashboardTableSection[]) => `${sections.length.toLocaleString('ko-KR')}개 조직 섹션`;

const formatOrganizationCell = (section: DashboardTableSection) =>
  `${section.orgDisplayName} (${section.orgCode})\n기준조직 ${formatHeadcount(section.sourceRecordCount)}개\n갱신 ${formatDateLabel(section.lastUpdated)}`;

const formatIndentedLabel = (label: string, level: number) => `${' '.repeat(level * 4)}${label}`;

const formatMetricCells = (row: DashboardTableRow): ExportCellValue[] => [
  formatHeadcount(row.actual2025.headcount),
  formatPercent(row.actual2025.ratio),
  formatHeadcount(row.actual2025.reallocated),
  formatHeadcount(row.target2026.headcount),
  formatPercent(row.target2026.ratio),
  formatSignedHeadcount(row.target2026.delta),
  formatHeadcount(row.target2026.reallocated),
  formatHeadcount(row.current202604.headcount),
  formatPercent(row.current202604.ratio),
  formatSignedHeadcount(row.current202604.delta),
  formatHeadcount(row.current202604.reallocated)
];

export const buildOrganizationWorkforceDashboardExportModel = ({
  exportedAt = new Date(),
  filters,
  sections
}: BuildOrganizationWorkforceDashboardExportModelParams): OrganizationWorkforceDashboardExportModel => {
  const rows: OrganizationWorkforceDashboardExportRow[] = [
    {
      kind: 'title',
      values: [REPORT_TITLE, ...buildBlankRow().slice(1)]
    },
    {
      kind: 'meta',
      values: buildMergedValueRow('내보내기 시각', formatDisplayTimestamp(exportedAt))
    },
    {
      kind: 'meta',
      values: buildMergedValueRow('기준 월', filters.snapshotMonth ?? filters.baseMonth ?? '-')
    },
    {
      kind: 'meta',
      values: buildMergedValueRow('적용 조직', formatOrganizationFilter(filters.selectedOrgName))
    },
    {
      kind: 'meta',
      values: buildMergedValueRow('검색어', formatKeyword(filters.keyword))
    },
    {
      kind: 'meta',
      values: buildMergedValueRow('내보내기 범위', formatExportScope(sections))
    },
    {
      kind: 'spacer',
      values: buildBlankRow()
    }
  ];

  const merges: Range[] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: TOTAL_COLUMN_COUNT - 1 }
    }
  ];

  for (let rowIndex = 1; rowIndex <= 5; rowIndex += 1) {
    merges.push({
      s: { r: rowIndex, c: 1 },
      e: { r: rowIndex, c: TOTAL_COLUMN_COUNT - 1 }
    });
  }

  const headerGroupRowIndex = rows.length;

  rows.push({
    kind: 'headerGroup',
    values: [
      '조직',
      '구분',
      "'25년말 실적",
      '',
      '',
      "'26년말 목표",
      '',
      '',
      '',
      "'26.4월 현재 실적",
      '',
      '',
      ''
    ]
  });

  rows.push({
    kind: 'headerSub',
    values: ['', '', '인력', '비중', '재배치', '인력', '비중', '인력증감', '재배치', '인력', '비중', '인력증감', '재배치']
  });

  merges.push(
    {
      s: { r: headerGroupRowIndex, c: 0 },
      e: { r: headerGroupRowIndex + 1, c: 0 }
    },
    {
      s: { r: headerGroupRowIndex, c: 1 },
      e: { r: headerGroupRowIndex + 1, c: 1 }
    },
    {
      s: { r: headerGroupRowIndex, c: 2 },
      e: { r: headerGroupRowIndex, c: 4 }
    },
    {
      s: { r: headerGroupRowIndex, c: 5 },
      e: { r: headerGroupRowIndex, c: 8 }
    },
    {
      s: { r: headerGroupRowIndex, c: 9 },
      e: { r: headerGroupRowIndex, c: 12 }
    }
  );

  sections.forEach((section) => {
    const sectionStartRowIndex = rows.length;

    section.rows.forEach((row, rowIndex) => {
      rows.push({
        kind: 'data',
        level: row.level,
        tone: row.tone,
        values: [
          rowIndex === 0 ? formatOrganizationCell(section) : '',
          formatIndentedLabel(row.label, row.level),
          ...formatMetricCells(row)
        ]
      });
    });

    if (section.rows.length > 1) {
      merges.push({
        s: { r: sectionStartRowIndex, c: 0 },
        e: { r: rows.length - 1, c: 0 }
      });
    }
  });

  const rowHeights: RowInfo[] = rows.map((row) => {
    if (row.kind === 'title') {
      return { hpt: 28 };
    }

    if (row.kind === 'spacer') {
      return { hpt: 8 };
    }

    if (row.kind === 'headerGroup' || row.kind === 'headerSub') {
      return { hpt: 22 };
    }

    if (row.kind === 'data' && row.values[0]) {
      return { hpt: 26 };
    }

    return { hpt: 20 };
  });

  return {
    columns: [
      { wch: 26 },
      { wch: 24 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 }
    ],
    fileName: buildFileName(filters.selectedOrgName, exportedAt),
    merges,
    rowHeights,
    rows,
    sheetName: SHEET_NAME
  };
};
