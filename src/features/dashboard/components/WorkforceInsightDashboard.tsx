import type { WorkforceInsightData } from '@features/dashboard/types/workforceInsight';
import { RefreshRounded } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Typography,
  alpha,
  keyframes
} from '@mui/material';
import type { Theme } from '@mui/material/styles';

type WorkforceInsightDashboardProps = {
  data: WorkforceInsightData | null;
  isLoading: boolean;
  error: string | null;
  selectedOrgCode: string;
  selectedMonth: string;
  trendData: WorkforceInsightData['trends'];
  onOrgChange: (orgCode: string) => void;
  onMonthChange: (month: string) => void;
  onRefresh: () => void;
};

const rise = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const easeCard = {
  transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: (theme: Theme) => `0 18px 30px ${alpha(theme.palette.primary.main, 0.22)}`,
    borderColor: 'primary.main'
  }
};

const palette = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444'];

const formatSigned = (value: number) => `${value >= 0 ? '+' : ''}${value.toLocaleString()}`;

export const WorkforceInsightDashboard = ({
  data,
  isLoading,
  error,
  selectedOrgCode,
  selectedMonth,
  trendData,
  onOrgChange,
  onMonthChange,
  onRefresh
}: WorkforceInsightDashboardProps) => {
  const maxTrend = Math.max(...trendData.map((item) => Math.max(item.headcount, item.target)), 1);
  const maxDivisionHeadcount = Math.max(...(data?.divisionComposition.map((division) => division.totalHeadcount) ?? [1]), 1);
  const kpiItems = data?.kpis ?? [];

  return (
    <Stack spacing={3}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 4,
          borderColor: 'divider',
          background: (theme) =>
            `linear-gradient(125deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.background.paper, 1)} 55%)`
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" gap={2}>
            <Box>
              <Typography variant="overline" sx={{ letterSpacing: '0.16em', color: 'text.secondary', fontWeight: 700 }}>
                Workforce Insight Hub
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
                Executive Workforce Overview
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Strategic headcount posture, division mix, and target readiness.
              </Typography>
              {data ? (
                <Chip
                  size="small"
                  label={`Last Updated ${data.lastUpdated}`}
                  sx={{ mt: 1.5, fontWeight: 600, bgcolor: alpha('#3B82F6', 0.12), color: '#1D4ED8' }}
                />
              ) : null}
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <FormControl size="small" sx={{ minWidth: 190 }}>
                <InputLabel id="insight-org">Division</InputLabel>
                <Select labelId="insight-org" value={selectedOrgCode} label="Division" onChange={(event) => onOrgChange(event.target.value)}>
                  {data?.organizationOptions.map((option) => (
                    <MenuItem key={option.orgCode} value={option.orgCode}>
                      {option.orgDisplayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="insight-month">Month</InputLabel>
                <Select labelId="insight-month" value={selectedMonth} label="Month" onChange={(event) => onMonthChange(event.target.value)}>
                  {data?.availableMonths.map((month) => (
                    <MenuItem key={month} value={month}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button startIcon={<RefreshRounded />} variant="contained" onClick={onRefresh}>
                Refresh
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {isLoading ? <LinearProgress /> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={2}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={`kpi-${index}`} variant="rounded" height={132} />)
          : kpiItems.map((kpi) => (
              <Card key={kpi.id} variant="outlined" sx={{ borderRadius: 3, animation: `${rise} 340ms ease`, ...easeCard }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.08em' }}>
                    {kpi.label.toUpperCase()}
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 800 }}>
                    {kpi.format === 'percent' ? kpi.value.toFixed(1) : kpi.value.toLocaleString()}
                    {kpi.suffix ?? ''}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, color: kpi.delta && kpi.delta < 0 ? 'error.main' : 'success.main', fontWeight: 700 }}
                  >
                    {kpi.delta ? `${formatSigned(Number(kpi.delta.toFixed(1)))} vs baseline` : 'No delta'}
                  </Typography>
                </CardContent>
              </Card>
            ))}
      </Box>

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '1.45fr 1fr' }} gap={2}>
        <Card variant="outlined" sx={{ borderRadius: 3, ...easeCard }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800}>
              Headcount Trend vs Target Trajectory
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Recent momentum with projected target path.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${trendData.length}, minmax(0, 1fr))`, gap: 1.2, alignItems: 'end', minHeight: 210 }}>
              {trendData.map((point, index) => (
                <Stack key={point.month} alignItems="center" spacing={0.8} sx={{ animation: `${rise} ${180 + index * 70}ms ease both` }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    {point.headcount.toLocaleString()}
                  </Typography>
                  <Box sx={{ width: '100%', position: 'relative', height: 136, display: 'flex', alignItems: 'end', justifyContent: 'center', gap: 0.8 }}>
                    <Box
                      sx={{
                        width: '36%',
                        borderRadius: 1,
                        bgcolor: '#6366F1',
                        height: `${(point.headcount / maxTrend) * 100}%`,
                        transition: 'height 450ms ease'
                      }}
                    />
                    <Box
                      sx={{
                        width: '36%',
                        borderRadius: 1,
                        bgcolor: alpha('#6366F1', 0.35),
                        height: `${(point.target / maxTrend) * 100}%`,
                        transition: 'height 450ms ease'
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {point.month}
                  </Typography>
                </Stack>
              ))}
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3, ...easeCard }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800}>
              Talent Mix by Capability Stream
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Category distribution for {data?.selectedOrgLabel ?? 'selected scope'}.
            </Typography>
            <Stack spacing={1.3}>
              {data?.categoryDistribution.map((item, index) => (
                <Box key={item.code}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.35 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {item.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.headcount.toLocaleString()} ({item.ratio.toFixed(1)}%)
                    </Typography>
                  </Stack>
                  <Box sx={{ height: 8, borderRadius: 99, bgcolor: alpha(palette[index % palette.length], 0.2), overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: '100%',
                        width: `${item.ratio}%`,
                        borderRadius: 99,
                        bgcolor: palette[index % palette.length],
                        transition: 'width 600ms ease'
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '1fr 1fr' }} gap={2}>
        <Card variant="outlined" sx={{ borderRadius: 3, ...easeCard }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800}>
              Division Benchmark (Current)
            </Typography>
            <Stack spacing={1.3} sx={{ mt: 2 }}>
              {data?.divisionComposition.map((division, index) => (
                <Box key={division.orgCode} sx={{ animation: `${rise} ${130 + index * 45}ms ease both` }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.4 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {division.orgName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {division.totalHeadcount.toLocaleString()}
                    </Typography>
                  </Stack>
                  <Box sx={{ height: 9, borderRadius: 99, bgcolor: 'action.hover', overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: '100%',
                        width: `${(division.totalHeadcount / maxDivisionHeadcount) * 100}%`,
                        borderRadius: 99,
                        bgcolor: '#0EA5E9',
                        transition: 'width 420ms ease'
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3, ...easeCard }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800}>
              Period Stacked Comparison
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Actual, current, and target composition by stream.
            </Typography>
            <Stack spacing={1.5}>
              {data?.stackedSeries.map((row, rowIndex) => {
                const total = row.actual + row.current + row.target || 1;
                const actualWidth = (row.actual / total) * 100;
                const currentWidth = (row.current / total) * 100;

                return (
                  <Box key={row.label} sx={{ animation: `${rise} ${160 + rowIndex * 50}ms ease both` }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {row.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.current.toLocaleString()} current
                      </Typography>
                    </Stack>
                    <Box sx={{ display: 'flex', height: 12, borderRadius: 99, overflow: 'hidden', bgcolor: 'action.hover' }}>
                      <Box sx={{ width: `${actualWidth}%`, bgcolor: '#6366F1', transition: 'width 500ms ease' }} />
                      <Box sx={{ width: `${currentWidth}%`, bgcolor: '#0EA5E9', transition: 'width 500ms ease' }} />
                      <Box sx={{ width: `${Math.max(100 - actualWidth - currentWidth, 0)}%`, bgcolor: '#10B981', transition: 'width 500ms ease' }} />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
};
