import { WorkforceInsightDashboard } from '@features/dashboard/components/WorkforceInsightDashboard';
import { useWorkforceInsightDashboard } from '@features/dashboard/hooks/useWorkforceInsightDashboard';

export const WorkforceInsightDashboardContainer = () => {
  const {
    error,
    insightData,
    isLoading,
    refresh,
    selectedMonth,
    selectedOrgCode,
    setSelectedMonth,
    setSelectedOrgCode,
    trendData
  } = useWorkforceInsightDashboard();

  return (
    <WorkforceInsightDashboard
      data={insightData}
      isLoading={isLoading}
      error={error}
      selectedOrgCode={selectedOrgCode}
      selectedMonth={selectedMonth}
      trendData={trendData}
      onOrgChange={setSelectedOrgCode}
      onMonthChange={setSelectedMonth}
      onRefresh={refresh}
    />
  );
};
