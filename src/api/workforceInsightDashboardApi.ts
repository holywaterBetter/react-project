import { organizationWorkforceDashboardApi } from '@api/organizationWorkforceDashboardApi';
import type { DevUserMode } from '@features/auth/types/devUserMode';
import type { WorkforceInsightData } from '@features/dashboard/types/workforceInsight';
import { mapToWorkforceInsightData } from '@features/dashboard/utils/workforceInsightMapper';
import type { DashboardApiResponse } from '@pages/organization-workforce-dashboard/types/organizationWorkforceDashboard';

export type WorkforceInsightDashboardQuery = {
  language: string;
  orgCode?: string;
  month?: string;
};

export const workforceInsightDashboardApi = {
  async getWorkforceInsightDashboard(
    user: DevUserMode,
    query: WorkforceInsightDashboardQuery
  ): Promise<
    DashboardApiResponse<WorkforceInsightData, { selectedOrgCode: string; selectedMonth: string }>
  > {
    const [metaResponse, listResponse] = await Promise.all([
      organizationWorkforceDashboardApi.getOrganizationWorkforceDashboardMeta(user, {
        snapshotMonth: query.month
      }),
      organizationWorkforceDashboardApi.getOrganizationWorkforceDashboardList(user, {
        snapshotMonth: query.month
      })
    ]);

    if (!metaResponse.success || !listResponse.success) {
      return {
        success: false,
        data: null as unknown as WorkforceInsightData,
        message: metaResponse.message || listResponse.message,
        meta: {
          selectedOrgCode: query.orgCode ?? '',
          selectedMonth: query.month ?? ''
        }
      };
    }

    const availableOrgCodes = new Set(listResponse.data.map((entry) => entry.orgCode));
    const fallbackOrgCode = availableOrgCodes.has('ALL')
      ? 'ALL'
      : metaResponse.data.organizationOptions[0]?.orgCode ?? '';
    const selectedOrgCode =
      query.orgCode && availableOrgCodes.has(query.orgCode) ? query.orgCode : fallbackOrgCode;
    const selectedMonth =
      query.month && metaResponse.data.availableSnapshotMonths.includes(query.month)
        ? query.month
        : metaResponse.data.baseMonth;

    return {
      success: true,
      data: mapToWorkforceInsightData(
        listResponse.data,
        metaResponse.data,
        selectedOrgCode,
        query.language
      ),
      message: 'Workforce insight dashboard fetched successfully.',
      meta: {
        selectedOrgCode,
        selectedMonth
      }
    };
  }
};
