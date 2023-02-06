import { createSlice } from '@reduxjs/toolkit';
import { configApi } from './configApi';

const initialState = {
  appData: {
    AdClassify: {
      ApiKeyName: null,
      Url: null,
    },
    AdPanel: {
      PlaceholderIndexDescription: null,
      PlaceholderIndexKeywords: null,
      PlaceholderIndexMetaTags: null,
      PlaceholderIndexTitle: null,
      PlaceholderLoginInfo: null,
      PlaceholderRobotsTxt: null,
      PlaceholderStyleCss: null,
      Url: null,
    },
    AdPay: {
      Url: null,
    },
    AdSelect: {
      Url: null,
    },
    AdServer: {
      Name: null,
      WalletAddress: null,
      WalletNodeHost: null,
      WalletNodePort: null,
      AllowZoneInIframe: null,
      AutoConfirmationEnabled: null,
      AutoRegistrationEnabled: null,
      AutoWithdrawalLimitAds: null,
      AutoWithdrawalLimitBsc: null,
      AutoWithdrawalLimitBtc: null,
      AutoWithdrawalLimitEth: null,
      ColdWalletAddress: null,
      ColdWalletIsActive: null,
      EmailVerificationRequired: null,
      HotWalletMaxValue: null,
      HotWalletMinValue: null,
      InventoryWhitelist: [],
      InventoryImportWhitelist: [],
      InventoryExportWhitelist: [],
      MaxPageZones: null,
      OperatorRxFee: null,
      OperatorTxFee: null,
      ReferralRefundEnabled: null,
      ReferralRefundCommission: null,
      RegistrationMode: null,
      SiteClassifierLocalBanners: null,
      SiteAcceptBannersManually: null,
      Url: null,
      PrivacyPolicy: null,
      Terms: null,
      CrmMailAddressOnCampaignCreated: null,
      CrmMailAddressOnSiteAdded: null,
      CrmMailAddressOnUserRegistered: null,
      InventoryPrivate: null,
      CampaignMinBudget: null,
      CampaignMinCpa: null,
      CampaignMinCpm: null,
      UploadLimitImage: null,
      UploadLimitModel: null,
      UploadLimitVideo: null,
      UploadLimitZip: null,
      AdvertiserApplyFormUrl: null,
      PublisherApplyFormUrl: null,
      DefaultUserRoles: null,
    },
    AdUser: {
      InternalUrl: null,
      Url: null,
    },
    General: {
      SmtpHost: null,
      SmtpPort: null,
      SmtpSender: null,
      SmtpUsername: null,
      SmtpPassword: null,
      Domain: null,
      SupportEmail: null,
      TechnicalEmail: null,
      SupportTelegram: null,
    },
  },
};

const configSlice = createSlice({
  name: 'configSlice',
  initialState,
  reducers: {
    changeBaseInformation: (state, { payload }) => {
      state.appData.AdServer = { ...state.appData.AdServer, ...payload.AdServer };
      state.appData.General = { ...state.appData.General, ...payload.General };
    },
    changeCrmNotificationsInformation: (state, { payload }) => {
      state.appData.AdServer = { ...state.appData.AdServer, ...payload.AdServer };
    },
    changePlaceholdersInformation: (state, { payload }) => {
      state.appData.AdPanel = { ...state.appData.AdPanel, ...payload.AdPanel };
    },
    changeSiteOptionsInformation: (state, { payload }) => {
      state.appData.AdServer = { ...state.appData.AdServer, ...payload.AdServer };
    },
    changeZoneOptionsInformation: (state, { payload }) => {
      state.appData.AdServer = { ...state.appData.AdServer, ...payload.AdServer };
    },
    changeCampaignSettingsInformation: (state, { payload }) => {
      state.appData.AdServer = { ...state.appData.AdServer, ...payload.AdServer };
    },
    changeBannerSettingsInformation: (state, { payload }) => {
      state.appData.AdServer = { ...state.appData.AdServer, ...payload.AdServer };
    },
    changeRegistrationModeInformation: (state, { payload }) => {
      state.appData.AdServer = { ...state.appData.AdServer, ...payload.AdServer };
    },
    changeAutoWithdrawalConfigInformation: (state, { payload }) => {
      state.appData.AdServer = { ...state.appData.AdServer, ...payload.AdServer };
    },
    changeRegulationsInformation: (state, { payload }) => {
      state.appData.AdServer = { ...state.appData.AdServer, ...payload.AdServer };
    },
    changeInventoryWhitelistInformation: (state, { payload }) => {
      state.appData.AdServer = { ...state.appData.AdServer, ...payload };
    },
    changeCommissionsConfigInformation: (state, { payload }) => {
      state.appData.AdServer = { ...state.appData.AdServer, ...payload.AdServer };
    },
    changeColdWalletConfigInformation: (state, { payload }) => {
      state.appData.AdServer = { ...state.appData.AdServer, ...payload.AdServer };
    },
    changeWalletConfigInformation: (state, { payload }) => {
      state.appData.AdServer = { ...state.appData.AdServer, ...payload.AdServer };
    },
    changeSmtpConfigInformation: (state, { payload }) => {
      state.appData.General = { ...state.appData.General, ...payload.General };
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(configApi.endpoints.getAppConfig.matchFulfilled, (state, { payload }) => {
      state.appData = {
        AdClassify: { ...state.appData.AdClassify, ...payload.data.AdClassify },
        AdPanel: { ...state.appData.AdPanel, ...payload.data.AdPanel },
        AdPay: { ...state.appData.AdPay, ...payload.data.AdPay },
        AdSelect: { ...state.appData.AdSelect, ...payload.data.AdSelect },
        AdServer: { ...state.appData.AdServer, ...payload.data.AdServer },
        AdUser: { ...state.appData.AdUser, ...payload.data.AdUser },
        General: { ...state.appData.General, ...payload.data.General },
      };
    });
  },
});

export const {
  changeBaseInformation,
  changeCrmNotificationsInformation,
  changePlaceholdersInformation,
  changeSiteOptionsInformation,
  changeZoneOptionsInformation,
  changeCampaignSettingsInformation,
  changeBannerSettingsInformation,
  changeRegistrationModeInformation,
  changeAutoWithdrawalConfigInformation,
  changeRegulationsInformation,
  changeInventoryWhitelistInformation,
  changeCommissionsConfigInformation,
  changeColdWalletConfigInformation,
  changeWalletConfigInformation,
  changeSmtpConfigInformation,
} = configSlice.actions;
export default configSlice.reducer;
