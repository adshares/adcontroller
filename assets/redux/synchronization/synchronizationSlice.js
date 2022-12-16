import { createSlice } from '@reduxjs/toolkit';
import { synchronizationApi } from './synchronizationApi';
import { authApi } from '../auth/authApi';

const initialState = {
  synchronizationData: {
    isSynchronizationRequired: false,
    isDataSynchronized: true,
    changedModules: null,
    lastSync: localStorage.getItem('lastSync') || null,
  },
};

const synchronizationSlice = createSlice({
  name: 'synchronizationSlice',
  initialState,
  reducers: {
    setDataSynchronized: (state) => {
      state.synchronizationData = {
        ...state.synchronizationData,
        isDataSynchronized: true,
        changedModules: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(authApi.endpoints.getCurrentUser.matchFulfilled, (state) => {
      const isSyncRequired = state.synchronizationData.lastSync
        ? Date.now() - JSON.parse(state.synchronizationData.lastSync) > 24 * 60 * 60 * 1000
        : true;
      if (isSyncRequired) {
        state.synchronizationData = {
          ...state.synchronizationData,
          isSynchronizationRequired: true,
          isDataSynchronized: false,
          changedModules: null,
        };
      }
    });

    builder.addMatcher(synchronizationApi.endpoints.synchronizeConfig.matchFulfilled, (state, { payload }) => {
      const isModuleWacChanged = !Array.isArray(payload.data);
      const syncTime = JSON.stringify(Date.now());
      localStorage.setItem('lastSync', syncTime);
      if (!isModuleWacChanged) {
        state.synchronizationData = {
          isSynchronizationRequired: false,
          isDataSynchronized: true,
          changedModules: null,
          lastSync: syncTime,
        };
        return;
      }
      if (isModuleWacChanged) {
        state.synchronizationData = {
          isSynchronizationRequired: true,
          isDataSynchronized: false,
          changedModules: payload.data,
          lastSync: syncTime,
        };
      }
    });
  },
});

export const { setDataSynchronized } = synchronizationSlice.actions;
export default synchronizationSlice.reducer;
