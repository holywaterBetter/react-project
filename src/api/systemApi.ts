import { httpClient } from '@services/httpClient';
import type { ApiEnvelope } from '@shared-types/api';


export type HealthResponse = {
  status: 'ok';
  timestamp: string;
};

export const getSystemHealth = async () => {
  const response = await httpClient.get<ApiEnvelope<HealthResponse>>('/system/health');
  return response.data;
};
