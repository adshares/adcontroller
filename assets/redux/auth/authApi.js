import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import configuration from '../../controllerConfig/configuration';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: configuration.baseUrl,
  }),
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
