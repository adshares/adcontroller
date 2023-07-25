import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import configuration from '../controllerConfig/configuration';
import { setAppLogout } from './auth/authSlice';
import { setNotification } from './globalNotifications/globalNotificationsSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: configuration.basePath,
});

export const baseQueryWithGlobalErrorHandler = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error) {
    if (result.error.status === 401) {
      api.dispatch(setAppLogout());
    } else if (result.error.status >= 400) {
      api.dispatch(
        setNotification({
          showNotification: true,
          notificationType: 'error',
          notificationMessage: result.error.data.message || 'Unknown error',
        }),
      );
    }
  }
  return result;
};
