import { DownloadOutlined } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';

type ExcelDownloadButtonProps = {
  disabled?: boolean;
  isLoading?: boolean;
  onDownload: () => void;
};

export const ExcelDownloadButton = ({ disabled = false, isLoading = false, onDownload }: ExcelDownloadButtonProps) => (
  <Button
    variant="outlined"
    color="primary"
    onClick={onDownload}
    disabled={disabled || isLoading}
    startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <DownloadOutlined />}
  >
    엑셀 다운로드
  </Button>
);
