import { organizationWorkforceDashboardApi } from '@api/organizationWorkforceDashboardApi';
import { useDevUserMode } from '@features/auth/context/DevUserModeContext';
import { canSeeAllDivisions } from '@features/auth/types/devUserMode';
import type { WorkforceInsightData } from '@features/dashboard/types/workforceInsight';
import { mapToWorkforceInsightData } from '@features/dashboard/utils/workforceInsightMapper';
import { useWorkforceRepositoryVersion } from '@services/workforceRepository';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useWorkforceInsightDashboard = () => {
  const { activeUser } = useDevUserMode();
  const repositoryVersion = useWorkforceRepositoryVersion();
  const [selectedOrgCode, setSelectedOrgCode] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('2026.04');
  const [insightData, setInsightData] = useState<WorkforceInsightData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInsightData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [metaResponse, listResponse] = await Promise.all([
        organizationWorkforceDashboardApi.getOrganizationWorkforceDashboardMeta(activeUser),
        organizationWorkforceDashboardApi.getOrganizationWorkforceDashboardList(activeUser)
      ]);

      if (!metaResponse.success || !listResponse.success) {
        throw new Error(metaResponse.message || listResponse.message);
      }

      const nextSelectedOrgCode =
        canSeeAllDivisions(activeUser) || metaResponse.data.organizationOptions.length === 0
          ? selectedOrgCode
          : metaResponse.data.organizationOptions[0]?.orgCode ?? '';

      setSelectedOrgCode(nextSelectedOrgCode || (canSeeAllDivisions(activeUser) ? 'ALL' : ''));
      setSelectedMonth(metaResponse.data.baseMonth);
      setInsightData(
        mapToWorkforceInsightData(
          listResponse.data,
          metaResponse.data,
          nextSelectedOrgCode || (canSeeAllDivisions(activeUser) ? 'ALL' : '')
        )
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load workforce insights.');
      setInsightData(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeUser, selectedOrgCode]);

  useEffect(() => {
    if (canSeeAllDivisions(activeUser)) {
      setSelectedOrgCode('ALL');
      return;
    }

    setSelectedOrgCode('');
  }, [activeUser]);

  useEffect(() => {
    void loadInsightData();
  }, [loadInsightData, repositoryVersion]);

  const filteredTrend = useMemo(() => {
    if (!insightData) {
      return [];
    }

    return insightData.trends.map((point) => ({
      ...point,
      headcount: selectedMonth === point.month ? Math.round(point.headcount * 1.02) : point.headcount
    }));
  }, [insightData, selectedMonth]);

  return {
    activeUser,
    isLoading,
    error,
    insightData,
    filteredTrend,
    selectedOrgCode,
    selectedMonth,
    setSelectedOrgCode,
    setSelectedMonth,
    refresh: loadInsightData
  };
};
