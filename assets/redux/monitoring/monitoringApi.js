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

export const monitoringApi = createApi({
  reducerPath: 'monitoringApi',
  baseQuery: baseQueryWithCheckAuth,
  endpoints: (builder) => ({
    getWalletMonitoring: builder.query({
      query: () => ({
        url: '/api/monitoring/wallet',
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetWalletMonitoringQuery } = monitoringApi;
