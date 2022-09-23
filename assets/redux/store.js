import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authSlice from './auth/authSlice';
import { authApi } from './auth/authApi';
import { configApi } from './config/configApi';
import configSlice from './config/configSlice';
import { monitoringApi } from './monitoring/monitoringApi';
import monitoringSlice from './monitoring/monitoringSlice';
import { synchronizationApi } from './synchronization/synchronizationApi';
import synchronizationSlice from './synchronization/synchronizationSlice';

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token'],
};

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    authSlice: persistReducer(authPersistConfig, authSlice),

    [synchronizationApi.reducerPath]: synchronizationApi.reducer,
    synchronizationSlice: synchronizationSlice,

    [configApi.reducerPath]: configApi.reducer,
    configSlice: configSlice,

    [monitoringApi.reducerPath]: monitoringApi.reducer,
    monitoringSlice: monitoringSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      authApi.middleware,
      configApi.middleware,
      monitoringApi.middleware,
      synchronizationApi.middleware,
    ),
  devTools: process.env.NODE_ENV === 'development',
});

export const persistor = persistStore(store);
