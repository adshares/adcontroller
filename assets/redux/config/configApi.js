import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithGlobalErrorHandler } from '../apiBaseQuery';

export const configApi = createApi({
  reducerPath: 'configApi',
  baseQuery: baseQueryWithGlobalErrorHandler,
  endpoints: (builder) => ({
    getAppConfig: builder.query({
      query: () => ({
        url: '/api/config',
        method: 'GET',
      }),
    }),
    getLicenseData: builder.query({
      query: () => ({
        url: '/api/monitoring/license-data',
        method: 'GET',
      }),
    }),
    getWalletNode: builder.mutation({
      query: (body) => ({
        url: '/api/node_host',
        method: 'POST',
        body,
      }),
    }),
    setExistingLicense: builder.mutation({
      query: (body) => ({
        url: '/api/license_key',
        method: 'POST',
        body,
      }),
    }),
    setBaseInformation: builder.mutation({
      query: (body) => ({
        url: '/api/config/base-information',
        method: 'PATCH',
        body,
      }),
    }),
    setCrmNotificationsConfig: builder.mutation({
      query: (body) => ({
        url: '/api/config/crm-notifications',
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
    setInventoryWhitelistConfig: builder.mutation({
      query: (body) => ({
        url: '/api/config/whitelist',
        method: 'PATCH',
        body,
      }),
    }),
    setSiteOptionsConfig: builder.mutation({
      query: (body) => ({
        url: '/api/config/site-options',
        method: 'PATCH',
        body,
      }),
    }),
    setZoneOptionsConfig: builder.mutation({
      query: (body) => ({
        url: '/api/config/zone-options',
        method: 'PATCH',
        body,
      }),
    }),
    setPlaceholdersConfig: builder.mutation({
      query: (body) => ({
        url: '/api/config/panel-placeholders',
        method: 'PATCH',
        body,
      }),
    }),
    setCampaignSettingsConfig: builder.mutation({
      query: (body) => ({
        url: '/api/config/campaign-settings',
        method: 'PATCH',
        body,
      }),
    }),
    setBannerSettingsConfig: builder.mutation({
      query: (body) => ({
        url: '/api/config/banner-settings',
        method: 'PATCH',
        body,
      }),
    }),
    setRejectedDomainsSettingsConfig: builder.mutation({
      query: (body) => ({
        url: '/api/config/rejected-domains',
        method: 'PATCH',
        body,
      }),
    }),
    setRegistrationModeConfig: builder.mutation({
      query: (body) => ({
        url: '/api/config/registration',
        method: 'PATCH',
        body,
      }),
    }),
    setAutoWithdrawalConfig: builder.mutation({
      query: (body) => ({
        url: '/api/config/auto-withdrawal',
        method: 'PATCH',
        body,
      }),
    }),
    setRegulationsConfig: builder.mutation({
      query: (body) => ({
        url: '/api/config/regulations',
        method: 'PATCH',
        body,
      }),
    }),
    uploadAssets: builder.mutation({
      query: (body) => ({
        url: '/api/config/panel-assets',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useLazyGetAppConfigQuery,
  useGetLicenseDataQuery,
  useSetExistingLicenseMutation,
  useGetWalletNodeMutation,
  useSetBaseInformationMutation,
  useSetCrmNotificationsConfigMutation,
  useSetWalletConfigMutation,
  useSetColdWalletConfigMutation,
  useSetCommissionsConfigMutation,
  useSetInventoryWhitelistConfigMutation,
  useSetSiteOptionsConfigMutation,
  useSetZoneOptionsConfigMutation,
  useSetPlaceholdersConfigMutation,
  useSetCampaignSettingsConfigMutation,
  useSetBannerSettingsConfigMutation,
  useSetRejectedDomainsSettingsConfigMutation,
  useSetRegistrationModeConfigMutation,
  useSetAutoWithdrawalConfigMutation,
  useSetRegulationsConfigMutation,
  useUploadAssetsMutation,
} = configApi;
