import { createSlice } from '@reduxjs/toolkit';
import { configApi } from './configApi';

const initialState = {
  appData: {},
};

const configSlice = createSlice({
  name: 'configSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(configApi.endpoints.getAppConfig.matchFulfilled, (state, { payload }) => {
      state.appData = payload.data;
    });
    builder.addMatcher(configApi.endpoints.setWalletConfig.matchFulfilled, (state, { meta }) => {
      Object.entries(meta.arg.originalArgs).forEach((changedArg) => {
        if (state.appData.AdServer[changedArg[0]]) {
          state.appData.AdServer[changedArg[0]] = changedArg[1];
        }
      });
    });
    builder.addMatcher(configApi.endpoints.setBaseInformation.matchFulfilled, (state, { meta }) => {
      Object.entries(meta.arg.originalArgs).forEach((changedArg) => (state.appData.AdServer[changedArg[0]] = changedArg[1]));
    });
    builder.addMatcher(configApi.endpoints.setCrmNotificationsConfig.matchFulfilled, (state, { meta }) => {
      Object.entries(meta.arg.originalArgs).forEach((changedArg) => (state.appData.AdServer[changedArg[0]] = changedArg[1]));
    });
    builder.addMatcher(configApi.endpoints.setColdWalletConfig.matchFulfilled, (state, { meta }) => {
      Object.entries(meta.arg.originalArgs).forEach((changedArg) => (state.appData.AdServer[changedArg[0]] = changedArg[1]));
    });
    builder.addMatcher(configApi.endpoints.setCommissionsConfig.matchFulfilled, (state, { meta }) => {
      Object.entries(meta.arg.originalArgs).forEach((changedArg) => (state.appData.AdServer[changedArg[0]] = changedArg[1]));
    });
  },
});

export default configSlice.reducer;
