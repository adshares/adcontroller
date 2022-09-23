import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithGlobalErrorHandler } from '../apiBaseQuery';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithGlobalErrorHandler,
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (userData) => ({
        url: '/api/login',
        method: 'POST',
        body: userData,
      }),
    }),
  }),
});

export const { useLoginUserMutation } = authApi;
