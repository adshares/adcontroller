import { configureStore } from '@reduxjs/toolkit';
import globalNotificationsSlice from './globalNotifications/globalNotificationsSlice';
import { authApi } from './auth/authApi';
import authSlice from './auth/authSlice';
import { configApi } from './config/configApi';
import configSlice from './config/configSlice';
import { monitoringApi } from './monitoring/monitoringApi';
import monitoringSlice from './monitoring/monitoringSlice';
import { synchronizationApi } from './synchronization/synchronizationApi';
import synchronizationSlice from './synchronization/synchronizationSlice';
import { taxonomyApi } from './taxonomy/taxonomyApi';

export const store = configureStore({
  reducer: {
    globalNotificationsSlice: globalNotificationsSlice,

    [authApi.reducerPath]: authApi.reducer,
    authSlice: authSlice,

    [synchronizationApi.reducerPath]: synchronizationApi.reducer,
    synchronizationSlice: synchronizationSlice,

    [configApi.reducerPath]: configApi.reducer,
    configSlice: configSlice,

    [monitoringApi.reducerPath]: monitoringApi.reducer,
    monitoringSlice: monitoringSlice,

    [taxonomyApi.reducerPath]: taxonomyApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      authApi.middleware,
      configApi.middleware,
      monitoringApi.middleware,
      synchronizationApi.middleware,
      taxonomyApi.middleware,
    ),
  devTools: process.env.NODE_ENV === 'development',
});
