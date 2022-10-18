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
        url: `/api/monitoring/hosts`,
        params: {
          limit,
          ...(cursor ? { cursor } : {}),
        },
        method: 'GET',
      }),
    }),
    resetHostConnectionError: builder.mutation({
      query: ({ id }) => ({
        url: `/api/monitoring/hosts/${id}/reset`,
        method: 'PATCH',
      }),
    }),
    getEvents: builder.query({
      query: ({ limit, cursor, typeQueryParams }) => {
        const limitParamPhrase = `limit=${limit}`;
        const cursorParamPhrase = !!cursor ? `&cursor=${cursor}` : '';
        const typesQueryParamsPhrase = typeQueryParams.length
          ? typeQueryParams
              .map((param) => `&types[]=${param}`)
              .join(',')
              .replaceAll(',', '')
          : '';
        return {
          url: '/api/monitoring/events?' + limitParamPhrase + cursorParamPhrase + typesQueryParamsPhrase,
          method: 'GET',
        };
      },
    }),
  }),
});

export const { useGetWalletMonitoringQuery, useGetConnectedHostsQuery, useResetHostConnectionErrorMutation, useGetEventsQuery } =
  monitoringApi;
