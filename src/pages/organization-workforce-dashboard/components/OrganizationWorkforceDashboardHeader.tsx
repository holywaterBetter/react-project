import { Button, Chip, Stack, Typography } from '@mui/material';
import { formatDateLabel } from '@pages/organization-workforce-dashboard/utils/dashboardFormatters';

type OrganizationWorkforceDashboardHeaderProps = {
  baseMonth?: string;
  lastUpdated?: string;
  onRefresh: () => void;
};

export const OrganizationWorkforceDashboardHeader = ({
  baseMonth,
  lastUpdated,
  onRefresh
}: OrganizationWorkforceDashboardHeaderProps) => (
  <div className="rounded-[var(--radius-xl)] border border-line bg-surface px-6 py-5 shadow-sm">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <Stack spacing={1.25}>
        <Typography variant="h4">조직별 인력현황 및 재배치 실적 대시보드(안)</Typography>
        <Typography variant="body2" className="max-w-3xl text-ink-muted">
          조직별 인력 구성, 재배치 흐름, 연말 목표 대비 현재 실적을 한 화면에서 점검하는 내부 HR 보고서형 대시보드입니다.
        </Typography>
        <div className="flex flex-wrap gap-2">
          <Chip size="small" variant="outlined" label={`기준월 ${baseMonth ?? '-'}`} />
          <Chip size="small" variant="outlined" label={`최종 갱신 ${lastUpdated ? formatDateLabel(lastUpdated) : '-'}`} />
        </div>
      </Stack>

      <div className="flex flex-wrap gap-2">
        <Button variant="outlined" onClick={onRefresh}>
          새로고침
        </Button>
        <Button variant="outlined" disabled>
          Export 준비중
        </Button>
      </div>
    </div>
  </div>
);
