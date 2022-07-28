import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import configuration from '../../controllerConfig/configuration';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: configuration.baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().authSlice.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
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
