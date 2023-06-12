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
    getTaxonomy: builder.query({
      query: ({ medium, vendor }) => {
        const queryParams = queryString.stringify({ vendor }, { skipNull: true });
        return {
          url: `/api/taxonomy/media/${medium}?${queryParams}`,
          method: 'GET',
        };
      },
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
  }),
});

export const { useGetMediaQuery, useGetVendorListQuery, useGetTaxonomyQuery, useGetPlaceholdersQuery } = taxonomyApi;

// // placeholders
// fetch('http://localhost:8030/api/supply-placeholders')
//   .then((res) => res.json())
//   .then((data) => console.log(data))
//   .catch((err) => console.error(err));
//
// const parsed = {
//   'filter[medium]': 'metaverse',
//   'filter[vendor]': 'decentraland',
// };
// const query = queryString.stringify(parsed);
// // placeholders with filter
// fetch(`http://localhost:8030/api/supply-placeholders?${query}`)
//   .then((res) => res.json())
//   .then((data) => console.log(data))
//   .catch((err) => console.error(err));
//
// const uuid = 'e1ef118b-c0a1-49f8-8f77-244a8b04b553';
// // delete placeholder
// fetch(`http://localhost:8030/api/supply-placeholders/${uuid}`, {
//   method: 'DELETE',
// })
//   .then((res) => res.json())
//   .then((data) => console.log(data))
//   .catch((err) => console.error(err));
