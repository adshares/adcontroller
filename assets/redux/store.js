import { configureStore } from '@reduxjs/toolkit';
import authSlice from './auth/authSlice';
import { authApi } from './auth/authApi';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    authSlice: authSlice,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  devTools: process.env.NODE_ENV === 'development',
});
