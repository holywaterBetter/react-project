import type { InsightCompositionByScope } from '@features/dashboard/types/workforceInsight';

export type RatioSegment = {
  key: 'A' | 'B' | 'C';
  label: string;
  value: number;
  percentage: number;
};

export type OrgRatioRow = {
  organizationName: string;
  segments: RatioSegment[];
  total: number;
};

const SEGMENT_LABEL_BY_KEY: Record<RatioSegment['key'], string> = {
  A: 'A조직',
  B: 'B조직',
  C: 'C조직'
};

const toFiniteNumber = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);

const normalizePercentages = (values: number[]) => {
  const total = values.reduce((sum, value) => sum + value, 0);

  if (total <= 0) {
    return values.map(() => 0);
  }

  const rawPercentages = values.map((value) => (value / total) * 100);
  const floored = rawPercentages.map((value) => Math.floor(value));
  const remainder = 100 - floored.reduce((sum, value) => sum + value, 0);

  if (remainder === 0) {
    return floored;
  }

  const remainders = rawPercentages
    .map((value, index) => ({
      index,
      remainder: value - Math.floor(value)
    }))
    .sort((left, right) => right.remainder - left.remainder);

  const normalized = [...floored];

  for (let i = 0; i < remainder; i += 1) {
    normalized[remainders[i % remainders.length].index] += 1;
  }

  return normalized;
};

const deriveGroupKey = (categoryCode: string): RatioSegment['key'] => {
  const initial = categoryCode.charAt(0).toUpperCase();

  if (initial === 'A' || initial === 'B' || initial === 'C') {
    return initial;
  }

  return 'C';
};

export const mapCompositionToOrgRatioRows = (
  rows: InsightCompositionByScope[] | null | undefined
): OrgRatioRow[] => {
  if (!rows?.length) {
    return [];
  }

  return rows.map((row) => {
    const groupedTotals: Record<RatioSegment['key'], number> = {
      A: 0,
      B: 0,
      C: 0
    };

    row.categories.forEach((category) => {
      const key = deriveGroupKey(category.code);
      groupedTotals[key] += toFiniteNumber(category.headcount);
    });

    const values = [groupedTotals.A, groupedTotals.B, groupedTotals.C];
    const percentages = normalizePercentages(values);

    return {
      organizationName: row.orgName,
      total: values.reduce((sum, value) => sum + value, 0),
      segments: (['A', 'B', 'C'] as const).map((key, index) => ({
        key,
        label: SEGMENT_LABEL_BY_KEY[key],
        value: values[index],
        percentage: percentages[index]
      }))
    };
  });
};
