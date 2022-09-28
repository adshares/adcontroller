import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithGlobalErrorHandler } from '../apiBaseQuery';

export const synchronizationApi = createApi({
  reducerPath: 'synchronizationApi',
  baseQuery: baseQueryWithGlobalErrorHandler,
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
