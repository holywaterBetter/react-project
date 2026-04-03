import { organizationWorkforceDashboardApi } from '@api/organizationWorkforceDashboardApi';
import { buildOrganizationSections } from '@pages/organization-workforce-dashboard/utils/dashboardTableMapper';
import type {
  DashboardTableSection,
  OrganizationCategoryMappingResponse,
  OrganizationWorkforceDashboardMeta
} from '@pages/organization-workforce-dashboard/types/organizationWorkforceDashboard';
import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';

export const useOrganizationWorkforceDashboard = () => {
  const [selectedOrgCode, setSelectedOrgCode] = useState('');
  const [snapshotMonth, setSnapshotMonth] = useState('2026.04');
  const [keyword, setKeyword] = useState('');
  const [sections, setSections] = useState<DashboardTableSection[]>([]);
  const [meta, setMeta] = useState<OrganizationWorkforceDashboardMeta | null>(null);
  const [categoryMappings, setCategoryMappings] = useState<OrganizationCategoryMappingResponse>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const deferredKeyword = useDeferredValue(keyword.trim().toLowerCase());

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [metaResponse, mappingResponse, listResponse] = await Promise.all([
        organizationWorkforceDashboardApi.getOrganizationWorkforceDashboardMeta(),
        organizationWorkforceDashboardApi.getOrganizationCategoryMappings(),
        selectedOrgCode
          ? organizationWorkforceDashboardApi.getOrganizationWorkforceDashboardByOrg(selectedOrgCode)
          : organizationWorkforceDashboardApi.getOrganizationWorkforceDashboardList()
      ]);

      if (!metaResponse.success) {
        throw new Error(metaResponse.message);
      }

      if (!mappingResponse.success) {
        throw new Error(mappingResponse.message);
      }

      if (!listResponse.success) {
        throw new Error(listResponse.message);
      }

      const entries = Array.isArray(listResponse.data)
        ? listResponse.data
        : listResponse.data
          ? [listResponse.data]
          : [];

      setMeta(metaResponse.data);
      setCategoryMappings(mappingResponse.data);
      setSections(buildOrganizationSections(entries));
      setSnapshotMonth(metaResponse.data.baseMonth);
    } catch (loadError) {
      setSections([]);
      setError(loadError instanceof Error ? loadError.message : '조직별 대시보드 데이터를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedOrgCode]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard, refreshToken]);

  const filteredSections = useMemo(() => {
    if (!deferredKeyword) {
      return sections;
    }

    return sections.filter((section) => {
      const keywords = [section.orgDisplayName, section.orgName, section.orgCode].join(' ').toLowerCase();
      return keywords.includes(deferredKeyword);
    });
  }, [deferredKeyword, sections]);

  const handleOrganizationChange = useCallback((nextOrgCode: string) => {
    startTransition(() => {
      setSelectedOrgCode(nextOrgCode);
    });
  }, []);

  const handleSnapshotMonthChange = useCallback((nextSnapshotMonth: string) => {
    startTransition(() => {
      setSnapshotMonth(nextSnapshotMonth);
    });
  }, []);

  const refresh = useCallback(() => {
    setRefreshToken((current) => current + 1);
  }, []);

  return {
    filters: {
      selectedOrgCode,
      snapshotMonth,
      keyword
    },
    viewState: {
      isLoading,
      error,
      isEmpty: !isLoading && filteredSections.length === 0
    },
    dataState: {
      meta,
      categoryMappings,
      sections: filteredSections
    },
    actions: {
      setKeyword,
      handleOrganizationChange,
      handleSnapshotMonthChange,
      refresh
    }
  };
};
