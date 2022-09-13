import { configureStore } from '@reduxjs/toolkit';
import authSlice from './auth/authSlice';
import { authApi } from './auth/authApi';
import { configApi } from './config/configApi';
import configSlice from './config/configSlice';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    authSlice: authSlice,

    [configApi.reducerPath]: configApi.reducer,
    configSlice: configSlice,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }).concat(authApi.middleware, configApi.middleware),
  devTools: process.env.NODE_ENV === 'development',
});
