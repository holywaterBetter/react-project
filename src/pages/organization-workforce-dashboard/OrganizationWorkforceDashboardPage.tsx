import { canSeeAllDivisions } from '@features/auth/types/devUserMode';
import { useAppTranslation } from '@hooks/useAppTranslation';
import { Alert, Button, Stack } from '@mui/material';
import { OrganizationWorkforceDashboardFilters } from '@pages/organization-workforce-dashboard/components/OrganizationWorkforceDashboardFilters';
import { OrganizationWorkforceDashboardHeader } from '@pages/organization-workforce-dashboard/components/OrganizationWorkforceDashboardHeader';
import { OrganizationWorkforceDashboardTable } from '@pages/organization-workforce-dashboard/components/OrganizationWorkforceDashboardTable';
import { useOrganizationWorkforceDashboard } from '@pages/organization-workforce-dashboard/hooks/useOrganizationWorkforceDashboard';
import { exportOrganizationWorkforceDashboardExcel } from '@utils/exportOrganizationWorkforceDashboardExcel';
import { useCallback, useMemo, useState } from 'react';

export const OrganizationWorkforceDashboardPage = () => {
  const { t } = useAppTranslation();
  const { activeUser, filters, viewState, dataState, actions } = useOrganizationWorkforceDashboard();
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const selectedOrgName = useMemo(() => {
    if (!filters.selectedOrgCode) {
      return null;
    }

    return (
      dataState.meta?.organizationOptions.find((option) => option.orgCode === filters.selectedOrgCode)?.orgDisplayName ??
      filters.selectedOrgCode
    );
  }, [dataState.meta?.organizationOptions, filters.selectedOrgCode]);

  const handleExport = useCallback(async () => {
    if (viewState.isLoading || dataState.sections.length === 0) {
      return;
    }

    setExportError(null);
    setIsExporting(true);

    try {
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          resolve();
        });
      });

      exportOrganizationWorkforceDashboardExcel({
        filters: {
          baseMonth: dataState.meta?.baseMonth,
          keyword: filters.keyword,
          selectedOrgName,
          snapshotMonth: filters.snapshotMonth
        },
        sections: dataState.sections
      });
    } catch (error) {
      console.error(error);
      setExportError(error instanceof Error ? error.message : t('workforceDashboard.errors.exportFallback'));
    } finally {
      setIsExporting(false);
    }
  }, [
    dataState.meta?.baseMonth,
    dataState.sections,
    filters.keyword,
    filters.snapshotMonth,
    selectedOrgName,
    t,
    viewState.isLoading
  ]);

  return (
    <Stack spacing={3}>
      <OrganizationWorkforceDashboardHeader
        baseMonth={dataState.meta?.baseMonth}
        isExportDisabled={viewState.isLoading || viewState.isEmpty}
        isExporting={isExporting}
        lastUpdated={dataState.meta?.lastUpdated}
        onExport={handleExport}
        onRefresh={actions.refresh}
      />

      <OrganizationWorkforceDashboardFilters
        organizationOptions={dataState.meta?.organizationOptions ?? []}
        selectedOrgCode={filters.selectedOrgCode}
        showAllOption={canSeeAllDivisions(activeUser)}
        snapshotMonth={filters.snapshotMonth}
        snapshotOptions={dataState.meta?.availableSnapshotMonths ?? ['2026.04']}
        keyword={filters.keyword}
        onOrganizationChange={actions.handleOrganizationChange}
        onSnapshotMonthChange={actions.handleSnapshotMonthChange}
        onKeywordChange={actions.setKeyword}
      />

      {exportError ? <Alert severity="warning">{exportError}</Alert> : null}

      {viewState.error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={actions.refresh}>
              {t('common.actions.retry')}
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
        periodLabels={{
          actual2025: dataState.meta?.compareLabel,
          target2026: dataState.meta?.targetLabel,
          current202604: dataState.meta?.currentLabel
        }}
      />
    </Stack>
  );
};
