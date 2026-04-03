import { workforceInsightDashboardApi } from '@api/workforceInsightDashboardApi';
import { useDevUserMode } from '@features/auth/context/DevUserModeContext';
import { canSeeAllDivisions } from '@features/auth/types/devUserMode';
import type { WorkforceInsightData } from '@features/dashboard/types/workforceInsight';
import { useAppTranslation } from '@hooks/useAppTranslation';
import { useCallback, useEffect, useState } from 'react';

export const useWorkforceInsightDashboard = () => {
  const { activeUser } = useDevUserMode();
  const { i18n } = useAppTranslation();
  const [selectedOrgCode, setSelectedOrgCode] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [insightData, setInsightData] = useState<WorkforceInsightData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInsightData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await workforceInsightDashboardApi.getWorkforceInsightDashboard(activeUser, {
        language: i18n.language,
        orgCode: selectedOrgCode || undefined,
        month: selectedMonth || undefined
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      setSelectedOrgCode((current) =>
        current === response.meta.selectedOrgCode ? current : response.meta.selectedOrgCode
      );
      setSelectedMonth((current) =>
        current === response.meta.selectedMonth ? current : response.meta.selectedMonth
      );
      setInsightData(response.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load workforce insights.');
      setInsightData(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeUser, i18n.language, selectedMonth, selectedOrgCode]);

  useEffect(() => {
    if (canSeeAllDivisions(activeUser)) {
      setSelectedOrgCode('ALL');
    } else {
      setSelectedOrgCode('');
    }
    setSelectedMonth('');
  }, [activeUser]);

  useEffect(() => {
    void loadInsightData();
  }, [loadInsightData]);

  return {
    activeUser,
    isLoading,
    error,
    insightData,
    trendData: insightData?.trends ?? [],
    selectedOrgCode,
    selectedMonth,
    setSelectedOrgCode,
    setSelectedMonth,
    refresh: loadInsightData
  };
};
