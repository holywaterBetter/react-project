import type { WorkforceInsightData } from '@features/dashboard/types/workforceInsight';
import { useAppTranslation } from '@hooks/useAppTranslation';
import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha
} from '@mui/material';

type WorkforceMovementInfographicSectionProps = {
  movementInfographic: WorkforceInsightData['movementInfographic'];
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const achievementTone = (rate: number) => {
  if (rate >= 100) {
    return {
      color: '#0F766E',
      background: alpha('#14B8A6', 0.14)
    };
  }

  if (rate >= 80) {
    return {
      color: '#0369A1',
      background: alpha('#0EA5E9', 0.14)
    };
  }

  return {
    color: '#9A3412',
    background: alpha('#FB923C', 0.17)
  };
};

const CATEGORY_BACKGROUND = {
  A1: 'color-mix(in srgb, var(--color-brand-50) 24%, var(--color-bg-raised) 76%)',
  B3: 'color-mix(in srgb, var(--color-success-100) 28%, var(--color-bg-raised) 72%)',
  B2: 'color-mix(in srgb, var(--color-success-100) 24%, var(--color-bg-raised) 76%)',
  B1: 'color-mix(in srgb, var(--color-brand-50) 14%, var(--color-bg-raised) 86%)',
  C1: 'color-mix(in srgb, var(--color-warning-100) 38%, var(--color-bg-raised) 62%)'
} as const;

export const WorkforceMovementInfographicSection = ({
  movementInfographic
}: WorkforceMovementInfographicSectionProps) => {
  const { t } = useAppTranslation();

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              {t('insight.infographic.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
              {t('insight.infographic.description')}
            </Typography>
          </Box>

          <Box display="grid" gridTemplateColumns={{ xs: '1fr', xl: '1fr 1fr' }} gap={2}>
            <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={800}>
                  {t('insight.infographic.reductionTitle')}
                </Typography>
                <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                  {movementInfographic.scopeMetrics.map((row) => {
                    const tone = achievementTone(row.headcountAchievementRate);

                    return (
                      <Box
                        key={`${row.orgCode}-headcount`}
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          backgroundColor: 'background.default'
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Typography variant="body2" fontWeight={700}>
                            {row.orgName}
                          </Typography>
                          <Chip
                            size="small"
                            label={`${row.headcountAchievementRate.toFixed(1)}%`}
                            sx={{ fontWeight: 800, color: tone.color, bgcolor: tone.background }}
                          />
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.8 }}>
                          <Typography variant="caption" color="text.secondary">
                            {t('insight.infographic.target', {
                              value: row.targetHeadcount.toLocaleString()
                            })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('insight.infographic.achieved', {
                              value: row.achievedHeadcount.toLocaleString()
                            })}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={clamp(row.headcountAchievementRate, 0, 100)}
                          sx={{
                            mt: 0.7,
                            height: 8,
                            borderRadius: 999,
                            bgcolor: alpha('#64748B', 0.18),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 999,
                              bgcolor: '#6366F1'
                            }
                          }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={800}>
                  {t('insight.infographic.reallocationTitle')}
                </Typography>
                <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                  {movementInfographic.scopeMetrics.map((row) => {
                    const tone = achievementTone(row.reallocatedAchievementRate);

                    return (
                      <Box
                        key={`${row.orgCode}-reallocated`}
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          backgroundColor: 'background.default'
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Typography variant="body2" fontWeight={700}>
                            {row.orgName}
                          </Typography>
                          <Chip
                            size="small"
                            label={`${row.reallocatedAchievementRate.toFixed(1)}%`}
                            sx={{ fontWeight: 800, color: tone.color, bgcolor: tone.background }}
                          />
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.8 }}>
                          <Typography variant="caption" color="text.secondary">
                            {t('insight.infographic.target', {
                              value: row.targetReallocated.toLocaleString()
                            })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('insight.infographic.achieved', {
                              value: row.achievedReallocated.toLocaleString()
                            })}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={clamp(row.reallocatedAchievementRate, 0, 100)}
                          sx={{
                            mt: 0.7,
                            height: 8,
                            borderRadius: 999,
                            bgcolor: alpha('#64748B', 0.18),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 999,
                              bgcolor: '#0EA5E9'
                            }
                          }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={800}>
                {t('insight.infographic.compositionTitle')}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 1.5 }}
              >
                {t('insight.infographic.compositionDescription')}
              </Typography>

              <TableContainer>
                <Table size="small" sx={{ minWidth: 940 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 170, backgroundColor: 'var(--color-bg-raised)' }}>
                        {t('insight.infographic.scope')}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ minWidth: 100, backgroundColor: 'var(--color-bg-raised)' }}
                      >
                        {t('insight.infographic.total')}
                      </TableCell>
                      {movementInfographic.compositionByScope[0]?.categories.map((category) => (
                        <TableCell
                          key={category.code}
                          align="center"
                          sx={{
                            minWidth: 120,
                            fontWeight: 700,
                            backgroundColor: CATEGORY_BACKGROUND[category.code]
                          }}
                        >
                          {category.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {movementInfographic.compositionByScope.map((row) => (
                      <TableRow key={`${row.orgCode}-composition`}>
                        <TableCell sx={{ fontWeight: 700 }}>{row.orgName}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {row.totalHeadcount.toLocaleString()}
                        </TableCell>
                        {row.categories.map((category) => (
                          <TableCell key={`${row.orgCode}-${category.code}`} align="right">
                            <Stack direction="row" justifyContent="flex-end" spacing={0.9}>
                              <Typography variant="body2" fontWeight={700}>
                                {category.ratio.toFixed(1)}%
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ({category.headcount.toLocaleString()})
                              </Typography>
                            </Stack>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Stack>
      </CardContent>
    </Card>
  );
};
