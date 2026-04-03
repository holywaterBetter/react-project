import { Alert, Button, Stack } from '@mui/material';
import { OrganizationWorkforceDashboardFilters } from '@pages/organization-workforce-dashboard/components/OrganizationWorkforceDashboardFilters';
import { OrganizationWorkforceDashboardHeader } from '@pages/organization-workforce-dashboard/components/OrganizationWorkforceDashboardHeader';
import { OrganizationWorkforceDashboardTable } from '@pages/organization-workforce-dashboard/components/OrganizationWorkforceDashboardTable';
import { useOrganizationWorkforceDashboard } from '@pages/organization-workforce-dashboard/hooks/useOrganizationWorkforceDashboard';

export const OrganizationWorkforceDashboardPage = () => {
  const { filters, viewState, dataState, actions } = useOrganizationWorkforceDashboard();

  return (
    <Stack spacing={3}>
      <OrganizationWorkforceDashboardHeader
        baseMonth={dataState.meta?.baseMonth}
        lastUpdated={dataState.meta?.lastUpdated}
        onRefresh={actions.refresh}
      />

      <OrganizationWorkforceDashboardFilters
        organizationOptions={dataState.meta?.organizationOptions ?? []}
        selectedOrgCode={filters.selectedOrgCode}
        snapshotMonth={filters.snapshotMonth}
        snapshotOptions={dataState.meta?.availableSnapshotMonths ?? ['2026.04']}
        keyword={filters.keyword}
        onOrganizationChange={actions.handleOrganizationChange}
        onSnapshotMonthChange={actions.handleSnapshotMonthChange}
        onKeywordChange={actions.setKeyword}
      />

      {viewState.error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={actions.refresh}>
              다시 시도
            </Button>
          }
        >
          {viewState.error}
        </Alert>
      ) : null}

      <OrganizationWorkforceDashboardTable
        sections={dataState.sections}
        isLoading={viewState.isLoading}
        isEmpty={viewState.isEmpty}
      />
    </Stack>
  );
};
