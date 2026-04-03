export const formatHeadcount = (value: number) => value.toLocaleString('ko-KR');

export const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export const formatSignedHeadcount = (value?: number | null) => {
  if (value === null || value === undefined) {
    return '-';
  }

  if (value === 0) {
    return '0';
  }

  return `${value > 0 ? '+' : ''}${value.toLocaleString('ko-KR')}`;
};

export const formatDateLabel = (value: string) => {
  if (!/^\d{8}$/.test(value)) {
    return value;
  }

  return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`;
};
