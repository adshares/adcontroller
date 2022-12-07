import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithGlobalErrorHandler } from '../apiBaseQuery';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithGlobalErrorHandler,
  endpoints: (builder) => ({
    getCurrentUser: builder.query({
      query: () => ({
        url: '/api/check',
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetCurrentUserQuery } = authApi;
