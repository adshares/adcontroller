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
    setBaseInformation: builder.mutation({
      query: (body) => ({
        url: '/api/config/base-information',
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
  useSetBaseInformationMutation,
  useSetWalletConfigMutation,
  useSetColdWalletConfigMutation,
  useSetCommissionsConfigMutation,
} = configApi;
