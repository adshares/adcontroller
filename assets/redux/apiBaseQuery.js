import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import configuration from '../controllerConfig/configuration';
import { setAppLogout } from './auth/authSlice';
import { setNotification } from './globalNotifications/globalNotificationsSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: configuration.baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().authSlice.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithGlobalErrorHandler = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    api.dispatch(setAppLogout());
    api.dispatch(
      setNotification({
        showNotification: true,
        notificationType: 'error',
        notificationMessage: result.error.data.message,
      }),
    );
  }
  if (result.error && result.error.status > 401 && result.error.status < 599) {
    api.dispatch(
      setNotification({
        showNotification: true,
        notificationType: 'error',
        notificationMessage: result.error.data.message || 'Unknown error',
      }),
    );
  }
  return result;
};
