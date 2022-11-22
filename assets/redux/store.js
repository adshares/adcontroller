import { configureStore } from '@reduxjs/toolkit';
import globalNotificationsSlice from './globalNotifications/globalNotificationsSlice';
import authSlice from './auth/authSlice';
import { configApi } from './config/configApi';
import configSlice from './config/configSlice';
import { monitoringApi } from './monitoring/monitoringApi';
import monitoringSlice from './monitoring/monitoringSlice';
import { synchronizationApi } from './synchronization/synchronizationApi';
import synchronizationSlice from './synchronization/synchronizationSlice';

export const store = configureStore({
  reducer: {
    globalNotificationsSlice: globalNotificationsSlice,

    authSlice: authSlice,

    [synchronizationApi.reducerPath]: synchronizationApi.reducer,
    synchronizationSlice: synchronizationSlice,

    [configApi.reducerPath]: configApi.reducer,
    configSlice: configSlice,

    [monitoringApi.reducerPath]: monitoringApi.reducer,
    monitoringSlice: monitoringSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      configApi.middleware,
      monitoringApi.middleware,
      synchronizationApi.middleware,
    ),
  devTools: process.env.NODE_ENV === 'development',
});
