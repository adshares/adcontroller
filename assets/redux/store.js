import { configureStore } from '@reduxjs/toolkit';
// import { someApi } from './someModule/someApi';
// import someSlice from './someModule/someSlice';

export const store = configureStore({
  reducer: {
    // [someApi.reducerPath]: someApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  devTools: process.env.NODE_ENV === 'development',
});
