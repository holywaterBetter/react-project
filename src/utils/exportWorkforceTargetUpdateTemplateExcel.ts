import * as XLSX from 'xlsx';

const TEMPLATE_FILE_NAME = 'workforce-target-2026-update-template.xlsx';

const TEMPLATE_HEADERS = [
  '기준월',
  '사업부명',
  '사업부코드',
  '조직코드',
  'A1_target',
  'B1_target',
  'B2_target',
  'B3_target',
  'C1_target',
  'A1_reallocation',
  'B1_reallocation',
  'B2_reallocation',
  'B3_reallocation',
  'C1_reallocation'
] as const;

const TEMPLATE_SAMPLE_ROWS = [
  ['202604', '미래전략실', 'C100000', 'C100101', 42, 24, 19, 7, 11, 2, 1, 1, 0, 1],
  ['202604', '글로벌사업실', 'C200000', 'C200310', 37, 18, 16, 8, 10, 1, 2, 1, 1, 0]
];

export const exportWorkforceTargetUpdateTemplateExcel = () => {
  const worksheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...TEMPLATE_SAMPLE_ROWS]);
  worksheet['!cols'] = TEMPLATE_HEADERS.map((header) => ({
    wch: Math.max(header.length + 2, 14)
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '26_Target_Update');
  XLSX.writeFile(workbook, TEMPLATE_FILE_NAME, {
    bookType: 'xlsx',
    compression: true
  });
};
