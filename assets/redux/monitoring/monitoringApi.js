import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithGlobalErrorHandler } from '../apiBaseQuery';

export const monitoringApi = createApi({
  reducerPath: 'monitoringApi',
  baseQuery: baseQueryWithGlobalErrorHandler,
  endpoints: (builder) => ({
    getWalletMonitoring: builder.query({
      query: () => ({
        url: '/api/monitoring/wallet',
        method: 'GET',
      }),
    }),
    getConnectedHosts: builder.query({
      query: () => ({
        url: '/api/monitoring/hosts',
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetWalletMonitoringQuery, useGetConnectedHostsQuery } = monitoringApi;
