import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';

type OrganizationOption = {
  orgCode: string;
  orgDisplayName: string;
};

type OrganizationWorkforceDashboardFiltersProps = {
  organizationOptions: OrganizationOption[];
  selectedOrgCode: string;
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
  snapshotMonth,
  snapshotOptions,
  keyword,
  onOrganizationChange,
  onSnapshotMonthChange,
  onKeywordChange
}: OrganizationWorkforceDashboardFiltersProps) => (
  <div className="rounded-[var(--radius-xl)] border border-line bg-surface px-5 py-4 shadow-sm">
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      <FormControl fullWidth>
        <InputLabel id="organization-workforce-dashboard-org-label">조직</InputLabel>
        <Select
          labelId="organization-workforce-dashboard-org-label"
          value={selectedOrgCode}
          label="조직"
          onChange={(event) => {
            onOrganizationChange(event.target.value);
          }}
        >
          <MenuItem value="">전체 조직</MenuItem>
          {organizationOptions.map((option) => (
            <MenuItem key={option.orgCode} value={option.orgCode}>
              {option.orgDisplayName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel id="organization-workforce-dashboard-snapshot-label">기준월</InputLabel>
        <Select
          labelId="organization-workforce-dashboard-snapshot-label"
          value={snapshotMonth}
          label="기준월"
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
        label="키워드 검색"
        value={keyword}
        onChange={(event) => {
          onKeywordChange(event.target.value);
        }}
        placeholder="조직명 또는 코드 검색"
      />
    </Stack>
  </div>
);
