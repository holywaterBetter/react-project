import { Alert, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { OrganizationWorkforceDashboardSection } from '@pages/organization-workforce-dashboard/components/OrganizationWorkforceDashboardSection';
import type { DashboardTableSection } from '@pages/organization-workforce-dashboard/types/organizationWorkforceDashboard';

type OrganizationWorkforceDashboardTableProps = {
  sections: DashboardTableSection[];
  isLoading: boolean;
  isEmpty: boolean;
};

const LoadingRows = () => (
  <>
    {Array.from({ length: 12 }).map((_, index) => (
      <TableRow key={`loading-row-${index}`}>
        {Array.from({ length: 13 }).map((__, cellIndex) => (
          <TableCell key={`loading-cell-${index}-${cellIndex}`}>
            <Skeleton animation="wave" height={20} />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

export const OrganizationWorkforceDashboardTable = ({
  sections,
  isLoading,
  isEmpty
}: OrganizationWorkforceDashboardTableProps) => {
  if (isEmpty) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-dashed border-line-strong bg-surface px-6 py-10 text-center">
        <Stack spacing={1}>
          <Typography variant="h6">조건에 맞는 조직이 없습니다.</Typography>
          <Typography variant="body2" className="text-ink-muted">
            조직 필터나 키워드를 조정해 다시 조회해 주세요.
          </Typography>
        </Stack>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-xl)] border border-line bg-surface shadow-sm">
      <TableContainer sx={{ maxHeight: '70vh' }}>
        <Table size="small" stickyHeader sx={{ minWidth: 1500 }}>
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2} sx={{ minWidth: 140, backgroundColor: 'var(--color-bg-raised)' }}>
                조직
              </TableCell>
              <TableCell rowSpan={2} sx={{ minWidth: 200, backgroundColor: 'var(--color-bg-raised)' }}>
                구분
              </TableCell>
              <TableCell colSpan={3} align="center" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                ’25년말 실적
              </TableCell>
              <TableCell colSpan={4} align="center" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                ’26년말 목표
              </TableCell>
              <TableCell colSpan={4} align="center" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                ’26.4월 현재 실적
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                인력
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                비중
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                재배치
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                인력
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                비중
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                인력증감
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                재배치
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                인력
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                비중
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                인력증감
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'var(--color-bg-raised)' }}>
                재배치
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? <LoadingRows /> : null}
            {!isLoading
              ? sections.map((section) => <OrganizationWorkforceDashboardSection key={section.orgCode} section={section} />)
              : null}
          </TableBody>
        </Table>
      </TableContainer>

      <div className="border-t border-line px-5 py-3">
        <Alert severity="info" variant="outlined">
          각 수치는 기존 조직 mock 데이터를 기반으로 산출한 비동기 mock API 응답이며, 행 구조는 A/B/C 카테고리 매핑을 기준으로 보고서형 표에 맞게 변환되었습니다.
        </Alert>
      </div>
    </div>
  );
};
