import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithGlobalErrorHandler } from '../apiBaseQuery';

const parseParamsEntries = (entries) => {
  const paramsEntries = [];
  entries.forEach((entry) => {
    if (Array.isArray(entry[1])) {
      entry[1].map((paramValue) => [`${entry[0]}[]`, paramValue]).forEach((entry) => paramsEntries.push(entry));
      return;
    }
    paramsEntries.push(entry);
  });
  return paramsEntries;
};

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
        const entries = Object.entries(queryConfig).filter((entry) => Boolean(entry[1])); // [['param', 'vale']]
        const urlQueryParams = new URLSearchParams(parseParamsEntries(entries));
        return {
          url: `/api/hosts`,
          params: urlQueryParams,
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
        const entries = Object.entries(queryConfig).filter((entry) => Boolean(entry[1])); // [['param', 'vale']]
        const urlQueryParams = new URLSearchParams(parseParamsEntries(entries));
        return {
          url: '/api/events',
          params: urlQueryParams,
          method: 'GET',
        };
      },
    }),
    getUsersList: builder.query({
      query: (queryConfig) => {
        const entries = Object.entries(queryConfig).filter((entry) => Boolean(entry[1])); // [['param', 'vale']]
        const urlQueryParams = new URLSearchParams(parseParamsEntries(entries));
        return {
          url: '/api/users',
          params: urlQueryParams,
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
