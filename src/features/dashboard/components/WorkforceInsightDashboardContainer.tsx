import { WorkforceInsightDashboard } from '@features/dashboard/components/WorkforceInsightDashboard';
import { useWorkforceInsightDashboard } from '@features/dashboard/hooks/useWorkforceInsightDashboard';

export const WorkforceInsightDashboardContainer = () => {
  const {
    error,
    filteredTrend,
    insightData,
    isLoading,
    refresh,
    selectedMonth,
    selectedOrgCode,
    setSelectedMonth,
    setSelectedOrgCode
  } = useWorkforceInsightDashboard();

  return (
    <WorkforceInsightDashboard
      data={insightData}
      isLoading={isLoading}
      error={error}
      selectedOrgCode={selectedOrgCode}
      selectedMonth={selectedMonth}
      trendData={filteredTrend}
      onOrgChange={setSelectedOrgCode}
      onMonthChange={setSelectedMonth}
      onRefresh={refresh}
    />
  );
};
