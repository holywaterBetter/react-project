import type { DashboardTableSection } from '@pages/organization-workforce-dashboard/types/organizationWorkforceDashboard';
import {
  buildOrganizationWorkforceDashboardExportModel,
  type OrganizationWorkforceDashboardExportFilters
} from '@pages/organization-workforce-dashboard/utils/exportMappers';

const filters: OrganizationWorkforceDashboardExportFilters = {
  baseMonth: '2026.04',
  keyword: '전략',
  selectedOrgName: '미래전략실',
  snapshotMonth: '2026.04'
};

const sections: DashboardTableSection[] = [
  {
    lastUpdated: '20260401',
    orgCode: 'ORG001',
    orgDisplayName: '미래전략실',
    orgName: '미래전략실',
    rows: [
      {
        actual2025: { delta: null, headcount: 120, ratio: 100, reallocated: 8 },
        current202604: { delta: 4, headcount: 124, ratio: 100, reallocated: 10 },
        id: 'ORG001-total',
        label: '계',
        level: 0,
        target2026: { delta: 6, headcount: 126, ratio: 100, reallocated: 11 },
        tone: 'total'
      },
      {
        actual2025: { delta: null, headcount: 30, ratio: 25, reallocated: 2 },
        current202604: { delta: 6, headcount: 36, ratio: 29, reallocated: 4 },
        id: 'ORG001-b1',
        label: 'AX',
        level: 2,
        target2026: { delta: 10, headcount: 40, ratio: 32, reallocated: 5 },
        tone: 'detail'
      }
    ],
    sourceRecordCount: 18
  }
];

describe('buildOrganizationWorkforceDashboardExportModel', () => {
  it('builds a report-shaped export model with grouped headers and merged organization rows', () => {
    const model = buildOrganizationWorkforceDashboardExportModel({
      exportedAt: new Date(2026, 3, 3, 9, 5),
      filters,
      sections
    });

    expect(model.sheetName).toBe('조직별 인력현황');
    expect(model.fileName).toBe('조직별_인력현황_및_재배치_실적_대시보드_미래전략실_20260403_0905.xlsx');
    expect(model.rows[0].values[0]).toBe('조직별 인력현황 및 재배치 실적 대시보드(안)');
    expect(model.rows[1].values[1]).toBe('2026.04.03 09:05');
    expect(model.rows[7].values[3]).toBe("'25년말 실적");
    expect(model.rows[8].values[3]).toBe('인력');
    expect(model.rows[9].values[0]).toBe('미래전략실');
    expect(model.rows[9].values[1]).toBe('2026.04.01');
    expect(model.rows[10].values[2]).toBe('        AX');
    expect(model.merges).toEqual(
      expect.arrayContaining([
        { s: { c: 0, r: 0 }, e: { c: 13, r: 0 } },
        { s: { c: 0, r: 9 }, e: { c: 0, r: 10 } },
        { s: { c: 1, r: 9 }, e: { c: 1, r: 10 } }
      ])
    );
  });
});
