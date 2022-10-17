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
      query: ({ limit, cursor }) => ({
        url: `/api/monitoring/hosts?limit=${limit}${!!cursor ? `&cursor=${cursor}` : ''}`,
        method: 'GET',
      }),
    }),
    resetHostConnectionError: builder.mutation({
      query: ({ id }) => ({
        url: `/api/monitoring/hosts/${id}/reset`,
        method: 'PATCH',
      }),
    }),
  }),
});

export const { useGetWalletMonitoringQuery, useGetConnectedHostsQuery, useResetHostConnectionErrorMutation } = monitoringApi;
