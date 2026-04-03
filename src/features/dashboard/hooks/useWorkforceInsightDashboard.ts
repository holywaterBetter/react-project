import { organizationWorkforceDashboardApi } from '@api/organizationWorkforceDashboardApi';
import type { WorkforceInsightData } from '@features/dashboard/types/workforceInsight';
import { mapToWorkforceInsightData } from '@features/dashboard/utils/workforceInsightMapper';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useWorkforceInsightDashboard = () => {
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
        organizationWorkforceDashboardApi.getOrganizationWorkforceDashboardMeta(),
        organizationWorkforceDashboardApi.getOrganizationWorkforceDashboardList()
      ]);

      if (!metaResponse.success || !listResponse.success) {
        throw new Error(metaResponse.message || listResponse.message);
      }

      setSelectedMonth(metaResponse.data.baseMonth);
      setInsightData(mapToWorkforceInsightData(listResponse.data, metaResponse.data, selectedOrgCode));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load workforce insights.');
      setInsightData(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedOrgCode]);

  useEffect(() => {
    void loadInsightData();
  }, [loadInsightData]);

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
