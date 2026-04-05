import type { OrgRatioRow, RatioSegment } from '@features/dashboard/utils/organizationRatioBarMapper';
import { Box, Chip, Stack, Tooltip, Typography, alpha } from '@mui/material';

type OrganizationRatioBarListProps = {
  rows: OrgRatioRow[];
};

const SEGMENT_COLOR: Record<RatioSegment['key'], string> = {
  A: '#C2415A',
  B: '#C58A12',
  C: '#2B6CB0'
};

const MIN_INSIDE_LABEL_PERCENT = 16;

const segmentLabel = (segment: RatioSegment) => `${segment.label} ${segment.percentage}%`;

const RatioBar = ({ row }: { row: OrgRatioRow }) => {
  const outsideSegments = row.segments.filter(
    (segment) => segment.percentage > 0 && segment.percentage < MIN_INSIDE_LABEL_PERCENT
  );

  return (
    <Stack spacing={0.8} sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          minHeight: 36,
          borderRadius: 999,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha('#64748B', 0.28),
          backgroundColor: 'background.paper'
        }}
      >
        {row.segments.map((segment) => {
          const showInsideLabel = segment.percentage >= MIN_INSIDE_LABEL_PERCENT;

          return (
            <Tooltip
              key={`${row.organizationName}-${segment.key}`}
              title={`${segment.label}: ${segment.value.toLocaleString()}명 (${segment.percentage}%)`}
              arrow
            >
              <Box
                sx={{
                  width: `${segment.percentage}%`,
                  minWidth: segment.percentage > 0 ? 2 : 0,
                  bgcolor: SEGMENT_COLOR[segment.key],
                  color: 'common.white',
                  px: showInsideLabel ? 1 : 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'width 420ms ease'
                }}
              >
                {showInsideLabel ? (
                  <Typography variant="caption" fontWeight={700} sx={{ lineHeight: 1.1 }}>
                    {segmentLabel(segment)}
                  </Typography>
                ) : null}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {outsideSegments.length ? (
        <Stack direction="row" gap={0.8} flexWrap="wrap">
          {outsideSegments.map((segment) => (
            <Chip
              key={`${row.organizationName}-${segment.key}-outside`}
              size="small"
              label={segmentLabel(segment)}
              sx={{
                bgcolor: alpha(SEGMENT_COLOR[segment.key], 0.12),
                color: SEGMENT_COLOR[segment.key],
                fontWeight: 700
              }}
            />
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
};

export const OrganizationRatioBarList = ({ rows }: OrganizationRatioBarListProps) => {
  if (!rows.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        표시할 조직 비율 데이터가 없습니다.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {rows.map((row) => (
        <Box
          key={row.organizationName}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '140px minmax(0, 1fr)' },
            gap: 1.25,
            alignItems: { xs: 'flex-start', md: 'center' },
            p: 1.25,
            border: '1px solid',
            borderColor: alpha('#64748B', 0.18),
            borderRadius: 2,
            backgroundColor: alpha('#F8FAFC', 0.4)
          }}
        >
          <Box>
            <Typography variant="body2" fontWeight={700}>
              {row.organizationName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              총 {row.total.toLocaleString()}명
            </Typography>
          </Box>
          <RatioBar row={row} />
        </Box>
      ))}

      <Stack direction="row" gap={1} flexWrap="wrap" pt={0.25}>
        {(['A', 'B', 'C'] as const).map((key) => (
          <Chip
            key={key}
            size="small"
            label={`${key}조직`}
            sx={{
              bgcolor: alpha(SEGMENT_COLOR[key], 0.12),
              color: SEGMENT_COLOR[key],
              fontWeight: 700
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
};
