import { organizationWorkforceDashboardApi } from '@api/organizationWorkforceDashboardApi';
import { useDevUserMode } from '@features/auth/context/DevUserModeContext';
import { canSeeAllDivisions } from '@features/auth/types/devUserMode';
import {
  type DashboardTableSection,
  type OrganizationCategoryMappingResponse,
  type OrganizationWorkforceDashboardMeta
} from '@pages/organization-workforce-dashboard/types/organizationWorkforceDashboard';
import { buildOrganizationSections } from '@pages/organization-workforce-dashboard/utils/dashboardTableMapper';
import { useWorkforceRepositoryVersion } from '@services/workforceRepository';
import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';

export const useOrganizationWorkforceDashboard = () => {
  const { activeUser } = useDevUserMode();
  const repositoryVersion = useWorkforceRepositoryVersion();
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

  useEffect(() => {
    if (canSeeAllDivisions(activeUser)) {
      setSelectedOrgCode('');
      return;
    }

    setSelectedOrgCode('');
  }, [activeUser]);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [metaResponse, mappingResponse, listResponse] = await Promise.all([
        organizationWorkforceDashboardApi.getOrganizationWorkforceDashboardMeta(activeUser),
        organizationWorkforceDashboardApi.getOrganizationCategoryMappings(),
        selectedOrgCode
          ? organizationWorkforceDashboardApi.getOrganizationWorkforceDashboardByOrg(activeUser, selectedOrgCode)
          : organizationWorkforceDashboardApi.getOrganizationWorkforceDashboardList(activeUser)
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
      setError(loadError instanceof Error ? loadError.message : 'Failed to load workforce dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, [activeUser, selectedOrgCode]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard, refreshToken, repositoryVersion]);

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
    activeUser,
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
