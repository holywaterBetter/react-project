import { ExcelDownloadButton } from '@components/ExcelDownloadButton';
import { ExcelUpload } from '@components/ExcelUpload';
import { useAppTranslation } from '@hooks/useAppTranslation';
import { Button, Chip, Divider, Stack, Typography } from '@mui/material';
import { formatDateLabel } from '@pages/organization-workforce-dashboard/utils/dashboardFormatters';

type OrganizationWorkforceDashboardHeaderProps = {
  baseMonth?: string;
  isUpdateDisabled: boolean;
  isExportDisabled: boolean;
  isExporting: boolean;
  isTemplateDownloading: boolean;
  isUploading: boolean;
  uploadSummary: string | null;
  hasUploadError: boolean;
  lastUpdated?: string;
  onExport: () => void | Promise<void>;
  onTemplateDownload: () => void | Promise<void>;
  onUpload: (file: File) => Promise<void>;
  onRefresh: () => void;
};

export const OrganizationWorkforceDashboardHeader = ({
  baseMonth,
  isUpdateDisabled,
  isExportDisabled,
  isExporting,
  isTemplateDownloading,
  isUploading,
  uploadSummary,
  hasUploadError,
  lastUpdated,
  onExport,
  onTemplateDownload,
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

        <div className="min-w-[340px] space-y-3">
          <div className="flex justify-end">
            <Button variant="outlined" onClick={onRefresh}>
              {t('workforceDashboard.header.refresh')}
            </Button>
          </div>

          <div className="rounded-lg border border-line px-4 py-3">
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {t('workforceDashboard.header.actions.targetUpdateTitle')}
            </Typography>
            <Typography variant="caption" className="text-ink-muted">
              {t('workforceDashboard.header.actions.targetUpdateDescription')}
            </Typography>
            <Stack direction="row" spacing={1.25} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
              <ExcelUpload
                disabled={isUpdateDisabled}
                isLoading={isUploading}
                label={t('workforceDashboard.header.actions.upload')}
                onUpload={onUpload}
              />
              <ExcelDownloadButton
                disabled={isUpdateDisabled}
                isLoading={isTemplateDownloading}
                label={t('workforceDashboard.header.actions.downloadTemplate')}
                onDownload={onTemplateDownload}
              />
            </Stack>
          </div>

          <Divider />

          <div className="rounded-lg border border-line px-4 py-3">
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {t('workforceDashboard.header.actions.exportTitle')}
            </Typography>
            <Typography variant="caption" className="text-ink-muted">
              {t('workforceDashboard.header.actions.exportDescription')}
            </Typography>
            <Stack direction="row" spacing={1.25} sx={{ mt: 1.5 }}>
              <ExcelDownloadButton
                disabled={isExportDisabled}
                isLoading={isExporting}
                label={t('workforceDashboard.header.download')}
                onDownload={onExport}
              />
            </Stack>
          </div>
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
