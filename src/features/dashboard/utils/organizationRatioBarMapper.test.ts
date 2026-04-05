import type { InsightCompositionByScope } from '@features/dashboard/types/workforceInsight';
import { mapCompositionToOrgRatioRows } from '@features/dashboard/utils/organizationRatioBarMapper';

const mockRows: InsightCompositionByScope[] = [
  {
    orgCode: 'ALL',
    orgName: '전사',
    totalHeadcount: 100,
    categories: [
      { code: 'A1', label: 'A', headcount: 68, ratio: 68 },
      { code: 'B1', label: 'B', headcount: 12, ratio: 12 },
      { code: 'B2', label: 'B', headcount: 8, ratio: 8 },
      { code: 'C1', label: 'C', headcount: 12, ratio: 12 }
    ]
  },
  {
    orgCode: 'MX',
    orgName: 'MX사업부',
    totalHeadcount: 73,
    categories: [
      { code: 'A1', label: 'A', headcount: 40, ratio: 54.7 },
      { code: 'B1', label: 'B', headcount: 18, ratio: 24.7 },
      { code: 'B3', label: 'B', headcount: 5, ratio: 6.8 },
      { code: 'C1', label: 'C', headcount: 10, ratio: 13.8 }
    ]
  }
];

describe('mapCompositionToOrgRatioRows', () => {
  it('groups categories into A/B/C segments and keeps each row at 100%', () => {
    const rows = mapCompositionToOrgRatioRows(mockRows);

    expect(rows[0].segments).toEqual([
      expect.objectContaining({ key: 'A', value: 68, percentage: 68 }),
      expect.objectContaining({ key: 'B', value: 20, percentage: 20 }),
      expect.objectContaining({ key: 'C', value: 12, percentage: 12 })
    ]);

    rows.forEach((row) => {
      const percentageTotal = row.segments.reduce((sum, segment) => sum + segment.percentage, 0);
      expect(percentageTotal).toBe(100);
    });
  });

  it('returns zeros safely when total headcount is empty or invalid', () => {
    const rows = mapCompositionToOrgRatioRows([
      {
        orgCode: 'ZERO',
        orgName: 'Zero',
        totalHeadcount: 0,
        categories: [
          { code: 'A1', label: 'A', headcount: 0, ratio: 0 },
          { code: 'B1', label: 'B', headcount: Number.NaN, ratio: 0 },
          { code: 'C1', label: 'C', headcount: -10, ratio: 0 }
        ]
      }
    ]);

    expect(rows[0].segments.map((segment) => segment.percentage)).toEqual([0, 0, 0]);
  });
});
