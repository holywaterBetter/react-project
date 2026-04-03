import type { OrganizationCategoryCode } from '@constants/organizationCategoryMap';

export type WorkforceInsightFilters = {
  orgCode: string;
  month: string;
};

export type InsightKpi = {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  delta?: number;
  format?: 'number' | 'percent';
};

export type InsightTrendPoint = {
  month: string;
  headcount: number;
  target: number;
};

export type InsightDivisionComposition = {
  orgCode: string;
  orgName: string;
  totalHeadcount: number;
  growthVsActual: number;
  reallocatedRatio: number;
};

export type InsightCategoryDistribution = {
  code: OrganizationCategoryCode;
  label: string;
  headcount: number;
  ratio: number;
};

export type InsightStackedBarItem = {
  label: string;
  actual: number;
  current: number;
  target: number;
};

export type WorkforceInsightData = {
  availableMonths: string[];
  organizationOptions: Array<{
    orgCode: string;
    orgDisplayName: string;
  }>;
  selectedOrgLabel: string;
  lastUpdated: string;
  kpis: InsightKpi[];
  trends: InsightTrendPoint[];
  divisionComposition: InsightDivisionComposition[];
  categoryDistribution: InsightCategoryDistribution[];
  stackedSeries: InsightStackedBarItem[];
};
