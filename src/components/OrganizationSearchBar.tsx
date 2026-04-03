import { ExcelDownloadButton } from '@components/ExcelDownloadButton';
import { ExcelUpload } from '@components/ExcelUpload';
import { useAppTranslation } from '@hooks/useAppTranslation';
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
  isDivisionLocked?: boolean;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDivisionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
  onDownload: () => void;
  onClearUploadPreview: () => void;
};

const filterFieldSx = {
  '& .MuiInputBase-input': {
    color: 'var(--color-fg-default)',
    WebkitTextFillColor: 'var(--color-fg-default)'
  },
  '& .MuiSelect-select': {
    color: 'var(--color-fg-default)',
    WebkitTextFillColor: 'var(--color-fg-default)'
  },
  '& .MuiSvgIcon-root': {
    color: 'var(--color-fg-muted)'
  }
} as const;

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
  isDivisionLocked = false,
  onSearchChange,
  onDivisionChange,
  onCategoryChange,
  onUpload,
  onDownload,
  onClearUploadPreview
}: OrganizationSearchBarProps) => {
  const { t } = useAppTranslation();

  return (
    <div className="rounded-[var(--radius-xl)] border border-line bg-surface p-5 shadow-sm">
      <Stack spacing={3}>
        <div className="flex flex-col gap-1">
          <Typography variant="h5">{t('organization.search.title')}</Typography>
          <Typography variant="body2" className="text-ink-muted">
            {t('organization.search.description')}
          </Typography>
        </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto_auto]">
        <TextField
          fullWidth
          label={t('organization.search.searchLabel')}
          placeholder={t('organization.search.searchPlaceholder')}
          value={searchValue}
          onChange={onSearchChange}
          sx={filterFieldSx}
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
          label={t('organization.search.divisionLabel')}
          value={divisionCode}
          sx={filterFieldSx}
          disabled={isDivisionLocked}
          onChange={(event) => {
            onDivisionChange(event.target.value);
          }}
        >
          {!isDivisionLocked ? <MenuItem value="">{t('organization.search.allOption')}</MenuItem> : null}
          {divisions.map((division) => (
            <MenuItem key={division.divisionCode} value={division.divisionCode}>
              {division.divisionName}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label={t('organization.search.categoryLabel')}
          value={categoryCode}
          sx={filterFieldSx}
          onChange={(event) => {
            onCategoryChange(event.target.value);
          }}
        >
          <MenuItem value="">{t('organization.search.allOption')}</MenuItem>
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
                {t('organization.actions.clearUpload')}
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
};
