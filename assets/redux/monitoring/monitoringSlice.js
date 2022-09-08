import { createSlice } from '@reduxjs/toolkit';
import { monitoringApi } from './monitoringApi';

const initialState = {
  monitoringData: {
    wallet: {
      balance: null,
      unusedBonuses: null,
    },
  },
};

const monitoringSlice = createSlice({
  name: 'monitoringSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(monitoringApi.endpoints.getWalletMonitoring.matchFulfilled, (state, { payload }) => {
      state.monitoringData = {
        wallet: { ...state.monitoringData.wallet, ...payload.data.wallet },
      };
    });
  },
});

export default monitoringSlice.reducer;
