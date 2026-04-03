import { useAppTranslation } from '@hooks/useAppTranslation';
import { DownloadOutlined } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';

type ExcelDownloadButtonProps = {
  disabled?: boolean;
  isLoading?: boolean;
  label?: string;
  onDownload: () => void | Promise<void>;
};

export const ExcelDownloadButton = ({
  disabled = false,
  isLoading = false,
  label,
  onDownload
}: ExcelDownloadButtonProps) => {
  const { t } = useAppTranslation();

  return (
    <Button
      variant="outlined"
      color="primary"
      onClick={() => {
        void onDownload();
      }}
      disabled={disabled || isLoading}
      startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <DownloadOutlined />}
    >
      {label ?? t('organization.actions.download')}
    </Button>
  );
};
