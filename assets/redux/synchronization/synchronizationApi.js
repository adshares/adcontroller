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

export const synchronizationApi = createApi({
  reducerPath: 'synchronizationApi',
  baseQuery: baseQueryWithCheckAuth,
  endpoints: (builder) => ({
    synchronizeConfig: builder.query({
      query: () => ({
        url: '/api/synchronize-config',
        method: 'GET',
      }),
    }),
  }),
});

export const { useLazySynchronizeConfigQuery } = synchronizationApi;
