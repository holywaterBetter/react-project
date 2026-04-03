import { ExcelDownloadButton } from '@components/ExcelDownloadButton';
import { ExcelUpload } from '@components/ExcelUpload';
import { ClearOutlined, SearchOutlined } from '@mui/icons-material';
import {
  Alert,
  Button,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import type { OrganizationCategorySummary, OrganizationDivisionSummary } from '@shared-types/org';
import type { ChangeEvent } from 'react';

type OrganizationSearchBarProps = {
  searchValue: string;
  divisionCode: string;
  categoryCode: string;
  divisions: OrganizationDivisionSummary[];
  categories: OrganizationCategorySummary[];
  isUploading: boolean;
  isExporting: boolean;
  uploadSummary: string | null;
  hasUploadedPreview: boolean;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDivisionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
  onDownload: () => void;
  onClearUploadPreview: () => void;
};

export const OrganizationSearchBar = ({
  searchValue,
  divisionCode,
  categoryCode,
  divisions,
  categories,
  isUploading,
  isExporting,
  uploadSummary,
  hasUploadedPreview,
  onSearchChange,
  onDivisionChange,
  onCategoryChange,
  onUpload,
  onDownload,
  onClearUploadPreview
}: OrganizationSearchBarProps) => (
  <div className="rounded-[var(--radius-xl)] border border-line bg-surface p-5 shadow-sm">
    <Stack spacing={3}>
      <div className="flex flex-col gap-1">
        <Typography variant="h5">조직 선택</Typography>
        <Typography variant="body2" className="text-ink-muted">
          조직명 검색, 사업부/조직분류 필터, 엑셀 업로드 및 다운로드를 한 화면에서 처리합니다.
        </Typography>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto_auto]">
        <TextField
          fullWidth
          label="조직명 검색"
          placeholder="조직명, 조직코드, 사업부를 검색하세요"
          value={searchValue}
          onChange={onSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" />
              </InputAdornment>
            )
          }}
        />
        <TextField
          select
          label="사업부"
          value={divisionCode}
          onChange={(event) => {
            onDivisionChange(event.target.value);
          }}
        >
          <MenuItem value="">전체</MenuItem>
          {divisions.map((division) => (
            <MenuItem key={division.divisionCode} value={division.divisionCode}>
              {division.divisionName}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="조직분류"
          value={categoryCode}
          onChange={(event) => {
            onCategoryChange(event.target.value);
          }}
        >
          <MenuItem value="">전체</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.categoryCode} value={category.categoryCode}>
              {category.categoryName}
            </MenuItem>
          ))}
        </TextField>
        <ExcelDownloadButton onDownload={onDownload} isLoading={isExporting} />
        <ExcelUpload onUpload={onUpload} isLoading={isUploading} />
      </div>

      {uploadSummary ? (
        <Alert
          severity={hasUploadedPreview ? 'success' : 'warning'}
          action={
            hasUploadedPreview ? (
              <Button
                color="inherit"
                size="small"
                startIcon={<ClearOutlined />}
                onClick={onClearUploadPreview}
              >
                업로드 해제
              </Button>
            ) : undefined
          }
        >
          {uploadSummary}
        </Alert>
      ) : null}
    </Stack>
  </div>
);
