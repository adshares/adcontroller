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
    updateUserDataReducer: (state, { payload }) => {
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

export const { updateUserDataReducer } = monitoringSlice.actions;

export default monitoringSlice.reducer;
