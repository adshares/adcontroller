import { createSlice } from '@reduxjs/toolkit';
import { monitoringApi } from './monitoringApi';

const initialState = {
  monitoringData: {
    wallet: {
      balance: null,
      unusedBonuses: null,
    },
    users: null,
  },
};

const monitoringSlice = createSlice({
  name: 'monitoringSlice',
  initialState,
  reducers: {
    confirmUserReducer: (state, { payload }) => {
      const userIdx = state.monitoringData.users.data.findIndex((user) => user.id === payload.data.id);
      state.monitoringData.users.data[userIdx] = payload.data;
    },
    switchToModeratorReducer: (state, { payload }) => {
      const userIdx = state.monitoringData.users.data.findIndex((user) => user.id === payload.data.id);
      state.monitoringData.users.data[userIdx] = payload.data;
    },
    switchToAgencyReducer: (state, { payload }) => {
      const userIdx = state.monitoringData.users.data.findIndex((user) => user.id === payload.data.id);
      state.monitoringData.users.data[userIdx] = payload.data;
    },
    switchToRegularReducer: (state, { payload }) => {
      const userIdx = state.monitoringData.users.data.findIndex((user) => user.id === payload.data.id);
      state.monitoringData.users.data[userIdx] = payload.data;
    },
    denyAdvertisingReducer: (state, { payload }) => {
      const userIdx = state.monitoringData.users.data.findIndex((user) => user.id === payload.data.id);
      state.monitoringData.users.data[userIdx] = payload.data;
    },
    grantAdvertisingReducer: (state, { payload }) => {
      const userIdx = state.monitoringData.users.data.findIndex((user) => user.id === payload.data.id);
      state.monitoringData.users.data[userIdx] = payload.data;
    },
    denyPublishingReducer: (state, { payload }) => {
      const userIdx = state.monitoringData.users.data.findIndex((user) => user.id === payload.data.id);
      state.monitoringData.users.data[userIdx] = payload.data;
    },
    grantPublishingReducer: (state, { payload }) => {
      const userIdx = state.monitoringData.users.data.findIndex((user) => user.id === payload.data.id);
      state.monitoringData.users.data[userIdx] = payload.data;
    },
    editUserReducer: (state, { payload }) => {
      const userIdx = state.monitoringData.users.data.findIndex((user) => user.id === payload.data.id);
      state.monitoringData.users.data[userIdx] = payload.data;
    },
    banUserReducer: (state, { payload }) => {
      const userIdx = state.monitoringData.users.data.findIndex((user) => user.id === payload.data.id);
      state.monitoringData.users.data[userIdx] = payload.data;
    },
    unbanUserReducer: (state, { payload }) => {
      const userIdx = state.monitoringData.users.data.findIndex((user) => user.id === payload.data.id);
      state.monitoringData.users.data[userIdx] = payload.data;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(monitoringApi.endpoints.getWalletMonitoring.matchFulfilled, (state, { payload }) => {
      state.monitoringData = {
        ...state.monitoringData,
        wallet: { ...state.monitoringData.wallet, ...payload.data.wallet },
      };
    });
    builder.addMatcher(monitoringApi.endpoints.getUsersList.matchFulfilled, (state, { payload }) => {
      state.monitoringData = {
        ...state.monitoringData,
        users: { ...payload },
      };
    });
  },
});

export const {
  confirmUserReducer,
  switchToModeratorReducer,
  switchToAgencyReducer,
  switchToRegularReducer,
  denyAdvertisingReducer,
  grantAdvertisingReducer,
  denyPublishingReducer,
  grantPublishingReducer,
  editUserReducer,
  banUserReducer,
  unbanUserReducer,
} = monitoringSlice.actions;

export default monitoringSlice.reducer;
