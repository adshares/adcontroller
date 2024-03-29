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
    getEventsLatest: builder.query({
      query: (queryConfig) => {
        const queryParams = queryString.stringify(queryConfig, { skipNull: true, arrayFormat: 'bracket' });
        return {
          url: `/api/events/latest?${queryParams}`,
          method: 'GET',
        };
      },
    }),
    getEventTypes: builder.query({
      query: () => {
        return {
          url: `/api/events/types`,
          method: 'GET',
        };
      },
    }),
    getTurnover: builder.query({
      query: (queryConfig) => {
        const queryParams = queryString.stringify(queryConfig, { skipNull: true, arrayFormat: 'bracket' });
        return {
          url: `/api/turnover?${queryParams}`,
          method: 'GET',
        };
      },
    }),
    getTurnoverByType: builder.query({
      query: (queryConfig) => {
        const { type, ...filters } = queryConfig;
        const queryParams = queryString.stringify(filters, { skipNull: true, arrayFormat: 'bracket' });
        return {
          url: `/api/turnover/${type}?${queryParams}`,
          method: 'GET',
        };
      },
    }),
    getTurnoverChart: builder.query({
      query: (queryConfig) => {
        const { chartResolution, ...filters } = queryConfig;
        const queryParams = queryString.stringify(filters, { skipNull: true, arrayFormat: 'bracket' });
        return {
          url: `/api/turnover/chart/${chartResolution}?${queryParams}`,
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
    confirmUser: builder.mutation({
      query: (id) => ({
        url: `/api/users/${id}/confirm`,
        method: 'PATCH',
      }),
    }),
    switchToAdmin: builder.mutation({
      query: (id) => ({
        url: `/api/users/${id}/switchToAdmin`,
        method: 'PATCH',
      }),
    }),
    switchToModerator: builder.mutation({
      query: (id) => ({
        url: `/api/users/${id}/switchToModerator`,
        method: 'PATCH',
      }),
    }),
    switchToAgency: builder.mutation({
      query: (id) => ({
        url: `/api/users/${id}/switchToAgency`,
        method: 'PATCH',
      }),
    }),
    switchToRegular: builder.mutation({
      query: (id) => ({
        url: `/api/users/${id}/switchToRegular`,
        method: 'PATCH',
      }),
    }),
    denyAdvertising: builder.mutation({
      query: (id) => ({
        url: `/api/users/${id}/denyAdvertising`,
        method: 'PATCH',
      }),
    }),
    grantAdvertising: builder.mutation({
      query: (id) => ({
        url: `/api/users/${id}/grantAdvertising`,
        method: 'PATCH',
      }),
    }),
    denyPublishing: builder.mutation({
      query: (id) => ({
        url: `/api/users/${id}/denyPublishing`,
        method: 'PATCH',
      }),
    }),
    grantPublishing: builder.mutation({
      query: (id) => ({
        url: `/api/users/${id}/grantPublishing`,
        method: 'PATCH',
      }),
    }),
    banUser: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/api/users/${id}/ban`,
        method: 'PATCH',
        body: { reason },
      }),
    }),
    unbanUser: builder.mutation({
      query: (id) => ({
        url: `/api/users/${id}/unban`,
        method: 'PATCH',
      }),
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/api/users/${id}`,
        method: 'DELETE',
      }),
    }),
    addUser: builder.mutation({
      query: (body) => ({
        url: `/api/users`,
        method: 'POST',
        body,
      }),
    }),
    editUser: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/users/${id}`,
        method: 'PATCH',
        body,
      }),
    }),
  }),
});

export const {
  useGetWalletMonitoringQuery,
  useGetConnectedHostsQuery,
  useResetHostConnectionErrorMutation,
  useGetEventsQuery,
  useGetEventsLatestQuery,
  useGetEventTypesQuery,
  useGetTurnoverQuery,
  useGetTurnoverByTypeQuery,
  useGetTurnoverChartQuery,
  useGetUsersListQuery,
  useConfirmUserMutation,
  useSwitchToAdminMutation,
  useSwitchToModeratorMutation,
  useSwitchToAgencyMutation,
  useSwitchToRegularMutation,
  useDenyAdvertisingMutation,
  useGrantAdvertisingMutation,
  useDenyPublishingMutation,
  useGrantPublishingMutation,
  useBanUserMutation,
  useUnbanUserMutation,
  useDeleteUserMutation,
  useAddUserMutation,
  useEditUserMutation,
} = monitoringApi;
