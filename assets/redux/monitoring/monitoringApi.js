import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithGlobalErrorHandler } from '../apiBaseQuery';
import queryString from 'query-string';

export const monitoringApi = createApi({
  reducerPath: 'monitoringApi',
  baseQuery: baseQueryWithGlobalErrorHandler,
  endpoints: (builder) => ({
    getWalletMonitoring: builder.query({
      query: () => ({
        url: '/api/wallet',
        method: 'GET',
      }),
    }),
    getConnectedHosts: builder.query({
      query: (queryConfig) => {
        const queryParams = queryString.stringify(queryConfig, { skipNull: true, arrayFormat: 'bracket' });
        return {
          url: `/api/hosts?${queryParams}`,
          method: 'GET',
        };
      },
    }),
    resetHostConnectionError: builder.mutation({
      query: ({ id }) => ({
        url: `/api/hosts/${id}/reset`,
        method: 'PATCH',
      }),
    }),
    getEvents: builder.query({
      query: (queryConfig) => {
        const queryParams = queryString.stringify(queryConfig, { skipNull: true, arrayFormat: 'bracket' });
        return {
          url: `/api/events?${queryParams}`,
          method: 'GET',
        };
      },
    }),
    getUsersList: builder.query({
      query: (queryConfig) => {
        const queryParams = queryString.stringify(queryConfig, { skipNull: true, arrayFormat: 'bracket' });
        return {
          url: `/api/users?${queryParams}`,
          method: 'GET',
        };
      },
    }),
  }),
});

export const {
  useGetWalletMonitoringQuery,
  useGetConnectedHostsQuery,
  useResetHostConnectionErrorMutation,
  useGetEventsQuery,
  useGetUsersListQuery,
} = monitoringApi;
