import { env } from '@constants/env';
import axios from 'axios';


export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

httpClient.interceptors.request.use(
  (config) => {
    // Attach tokens or trace IDs here in real projects.
    return config;
  },
  async (error: unknown) => Promise.reject(error)
);

httpClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    // Centralized error handling hook point.
    return Promise.reject(error);
  }
);
