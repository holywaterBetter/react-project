import { ExcelDownloadButton } from '@components/ExcelDownloadButton';
import { useAppTranslation } from '@hooks/useAppTranslation';
import { Button, Chip, Stack, Typography } from '@mui/material';
import { formatDateLabel } from '@pages/organization-workforce-dashboard/utils/dashboardFormatters';

type OrganizationWorkforceDashboardHeaderProps = {
  baseMonth?: string;
  isExportDisabled: boolean;
  isExporting: boolean;
  lastUpdated?: string;
  onExport: () => void | Promise<void>;
  onRefresh: () => void;
};

export const OrganizationWorkforceDashboardHeader = ({
  baseMonth,
  isExportDisabled,
  isExporting,
  lastUpdated,
  onExport,
  onRefresh
}: OrganizationWorkforceDashboardHeaderProps) => {
  const { t } = useAppTranslation();

  return (
    <div className="rounded-[var(--radius-xl)] border border-line bg-surface px-6 py-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <Stack spacing={1.25}>
          <Typography variant="h4">{t('workforceDashboard.header.title')}</Typography>
          <Typography variant="body2" className="max-w-3xl text-ink-muted">
            {t('workforceDashboard.header.description')}
          </Typography>
          <div className="flex flex-wrap gap-2">
            <Chip size="small" variant="outlined" label={t('workforceDashboard.header.baseMonth', { value: baseMonth ?? '-' })} />
            <Chip
              size="small"
              variant="outlined"
              label={t('workforceDashboard.header.lastUpdated', { value: lastUpdated ? formatDateLabel(lastUpdated) : '-' })}
            />
          </div>
        </Stack>

        <div className="flex flex-wrap gap-2">
          <Button variant="outlined" onClick={onRefresh}>
            {t('workforceDashboard.header.refresh')}
          </Button>
          <ExcelDownloadButton
            disabled={isExportDisabled}
            isLoading={isExporting}
            label={t('workforceDashboard.header.download')}
            onDownload={onExport}
          />
        </div>
      </div>
    </div>
  );
};
