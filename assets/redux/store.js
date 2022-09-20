import { configureStore } from '@reduxjs/toolkit';
import authSlice from './auth/authSlice';
import { authApi } from './auth/authApi';
import { configApi } from './config/configApi';
import configSlice from './config/configSlice';
import { monitoringApi } from './monitoring/monitoringApi';
import monitoringSlice from './monitoring/monitoringSlice';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    authSlice: authSlice,

    [configApi.reducerPath]: configApi.reducer,
    configSlice: configSlice,

    [monitoringApi.reducerPath]: monitoringApi.reducer,
    monitoringSlice: monitoringSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(authApi.middleware, configApi.middleware, monitoringApi.middleware),
  devTools: process.env.NODE_ENV === 'development',
});
