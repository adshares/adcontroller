import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithGlobalErrorHandler } from '../apiBaseQuery';
import queryString from 'query-string';

export const taxonomyApi = createApi({
  reducerPath: 'taxonomyApi',
  baseQuery: baseQueryWithGlobalErrorHandler,
  endpoints: (builder) => ({
    getMedia: builder.query({
      query: () => ({
        url: '/api/taxonomy/media',
        method: 'GET',
      }),
    }),
    getVendorList: builder.query({
      query: ({ medium }) => ({
        url: `/api/taxonomy/media/${medium}/vendors`,
        method: 'GET',
      }),
    }),
    getPlaceholders: builder.query({
      query: (queryConfig) => {
        const queryParams = queryString.stringify(queryConfig, { skipNull: true, arrayFormat: 'bracket' });
        return {
          url: `http://localhost:8030/api/supply-placeholders?${queryParams}`,
          method: 'GET',
        };
      },
    }),
    uploadSupplyPlaceholders: builder.mutation({
      query: (body) => ({
        url: '/api/supply-placeholders',
        method: 'POST',
        body,
      }),
    }),
    deleteSupplyPlaceholder: builder.mutation({
      query: ({ uuid }) => ({
        url: `/api/supply-placeholders/${uuid}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetMediaQuery,
  useGetVendorListQuery,
  useGetPlaceholdersQuery,
  useUploadSupplyPlaceholdersMutation,
  useDeleteSupplyPlaceholderMutation,
} = taxonomyApi;
