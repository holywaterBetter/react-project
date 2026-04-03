import { useAppTranslation } from '@hooks/useAppTranslation';
import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';

type OrganizationOption = {
  orgCode: string;
  orgDisplayName: string;
};

type OrganizationWorkforceDashboardFiltersProps = {
  organizationOptions: OrganizationOption[];
  selectedOrgCode: string;
  showAllOption: boolean;
  snapshotMonth: string;
  snapshotOptions: string[];
  keyword: string;
  onOrganizationChange: (value: string) => void;
  onSnapshotMonthChange: (value: string) => void;
  onKeywordChange: (value: string) => void;
};

export const OrganizationWorkforceDashboardFilters = ({
  organizationOptions,
  selectedOrgCode,
  showAllOption,
  snapshotMonth,
  snapshotOptions,
  keyword,
  onOrganizationChange,
  onSnapshotMonthChange,
  onKeywordChange
}: OrganizationWorkforceDashboardFiltersProps) => {
  const { t } = useAppTranslation();

  return (
    <div className="rounded-[var(--radius-xl)] border border-line bg-surface px-5 py-4 shadow-sm">
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <FormControl fullWidth>
          <InputLabel id="organization-workforce-dashboard-org-label">{t('workforceDashboard.filters.division')}</InputLabel>
          <Select
            labelId="organization-workforce-dashboard-org-label"
            value={selectedOrgCode}
            label={t('workforceDashboard.filters.division')}
            onChange={(event) => {
              onOrganizationChange(event.target.value);
            }}
          >
            {showAllOption ? <MenuItem value="">{t('workforceDashboard.filters.allDivisions')}</MenuItem> : null}
            {organizationOptions.map((option) => (
              <MenuItem key={option.orgCode} value={option.orgCode}>
                {option.orgDisplayName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="organization-workforce-dashboard-snapshot-label">{t('workforceDashboard.filters.baseMonth')}</InputLabel>
          <Select
            labelId="organization-workforce-dashboard-snapshot-label"
            value={snapshotMonth}
            label={t('workforceDashboard.filters.baseMonth')}
            onChange={(event) => {
              onSnapshotMonthChange(event.target.value);
            }}
          >
            {snapshotOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label={t('workforceDashboard.filters.keyword')}
          value={keyword}
          onChange={(event) => {
            onKeywordChange(event.target.value);
          }}
          placeholder={t('workforceDashboard.filters.keywordPlaceholder')}
        />
      </Stack>
    </div>
  );
};
