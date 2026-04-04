import { ExcelDownloadButton } from '@components/ExcelDownloadButton';
import { ExcelUpload } from '@components/ExcelUpload';
import { useAppTranslation } from '@hooks/useAppTranslation';
import { Button, Chip, Stack, Typography } from '@mui/material';
import { formatDateLabel } from '@pages/organization-workforce-dashboard/utils/dashboardFormatters';

type OrganizationWorkforceDashboardHeaderProps = {
  baseMonth?: string;
  isExportDisabled: boolean;
  isExporting: boolean;
  isUploading: boolean;
  uploadSummary: string | null;
  hasUploadError: boolean;
  lastUpdated?: string;
  onExport: () => void | Promise<void>;
  onUpload: (file: File) => Promise<void>;
  onRefresh: () => void;
};

export const OrganizationWorkforceDashboardHeader = ({
  baseMonth,
  isExportDisabled,
  isExporting,
  isUploading,
  uploadSummary,
  hasUploadError,
  lastUpdated,
  onExport,
  onUpload,
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
          <ExcelUpload
            disabled={isExportDisabled}
            isLoading={isUploading}
            label={t('workforceDashboard.header.actions.upload')}
            onUpload={onUpload}
          />
          <ExcelDownloadButton
            disabled={isExportDisabled}
            isLoading={isExporting}
            label={t('workforceDashboard.header.download')}
            onDownload={onExport}
          />
        </div>
      </div>
      {uploadSummary ? (
        <Typography variant="caption" className={hasUploadError ? 'mt-2 text-danger' : 'mt-2 text-ink-muted'}>
          {uploadSummary}
        </Typography>
      ) : null}
    </div>
  );
};
