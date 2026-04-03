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
  label = '엑셀 다운로드',
  onDownload
}: ExcelDownloadButtonProps) => (
  <Button
    variant="outlined"
    color="primary"
    onClick={() => {
      void onDownload();
    }}
    disabled={disabled || isLoading}
    startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <DownloadOutlined />}
  >
    {label}
  </Button>
);
