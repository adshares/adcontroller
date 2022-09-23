import { createSlice } from '@reduxjs/toolkit';
import { synchronizationApi } from './synchronizationApi';
import { authApi } from '../auth/authApi';

const initialState = {
  synchronizationData: {
    isSynchronizationRequired: false,
    isDataSynchronized: true,
    changedModules: null,
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
    builder.addMatcher(authApi.endpoints.loginUser.matchFulfilled, (state) => {
      state.synchronizationData = {
        isSynchronizationRequired: true,
        isDataSynchronized: false,
        changedModules: null,
      };
    });

    builder.addMatcher(synchronizationApi.endpoints.synchronizeConfig.matchFulfilled, (state, { payload }) => {
      const isModuleWacChanged = !Array.isArray(payload.data);
      if (!isModuleWacChanged) {
        state.synchronizationData = {
          isSynchronizationRequired: false,
          isDataSynchronized: true,
          changedModules: null,
        };
        return;
      }
      if (isModuleWacChanged) {
        state.synchronizationData = {
          isSynchronizationRequired: true,
          isDataSynchronized: false,
          changedModules: payload.data,
        };
      }
    });
  },
});

export const { setDataSynchronized } = synchronizationSlice.actions;
export default synchronizationSlice.reducer;
