import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import configuration from '../../controllerConfig/configuration';
import { setAppLogout } from '../auth/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: configuration.baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().authSlice.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});
const baseQueryWithCheckAuth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    api.dispatch(setAppLogout());
  }
  return result;
};

export const configApi = createApi({
  reducerPath: 'configApi',
  baseQuery: baseQueryWithCheckAuth,
  endpoints: (builder) => ({
    getAppConfig: builder.query({
      query: () => ({
        url: '/api/config',
        method: 'GET',
      }),
    }),
    getLicenseData: builder.query({
      query: () => ({
        url: '/api/config/license-data',
        method: 'GET',
      }),
    }),
    setExistingLicense: builder.mutation({
      query: (body) => ({
        url: '/api/license_key',
        method: 'POST',
        body,
      }),
    }),
    setBaseInformation: builder.mutation({
      query: (body) => ({
        url: '/api/config/base-information',
        method: 'PATCH',
        body,
      }),
    }),
    setCrmNotificationsConfig: builder.mutation({
      query: (body) => ({
        url: '/api/config/crm-notifications',
        method: 'PATCH',
        body,
      }),
    }),
    setWalletConfig: builder.mutation({
      query: (body) => ({
        url: '/api/config/wallet',
        method: 'PATCH',
        body,
      }),
    }),
    setColdWalletConfig: builder.mutation({
      query: (body) => ({
        url: '/api/config/cold-wallet',
        method: 'PATCH',
        body,
      }),
    }),
    setCommissionsConfig: builder.mutation({
      query: (body) => ({
        url: '/api/config/commission',
        method: 'PATCH',
        body,
      }),
    }),
  }),
});

export const {
  useGetAppConfigQuery,
  useGetLicenseDataQuery,
  useSetExistingLicenseMutation,
  useSetBaseInformationMutation,
  useSetCrmNotificationsConfigMutation,
  useSetWalletConfigMutation,
  useSetColdWalletConfigMutation,
  useSetCommissionsConfigMutation,
} = configApi;
