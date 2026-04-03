import { UploadFileOutlined } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';
import { useRef, type ChangeEvent } from 'react';

type ExcelUploadProps = {
  disabled?: boolean;
  isLoading?: boolean;
  onUpload: (file: File) => Promise<void>;
};

export const ExcelUpload = ({ disabled = false, isLoading = false, onUpload }: ExcelUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await onUpload(file);
    event.target.value = '';
  };

  return (
    <>
      <input
        ref={inputRef}
        hidden
        type="file"
        accept=".xlsx"
        onChange={(event) => {
          void handleChange(event);
        }}
      />
      <Button
        variant="contained"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isLoading}
        startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <UploadFileOutlined />}
      >
        엑셀 업로드
      </Button>
    </>
  );
};
