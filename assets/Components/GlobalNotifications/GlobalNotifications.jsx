import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import globalNotificationsSelectors from '../../redux/globalNotifications/globalNotificationsSelectors';
import { useSnackbar } from 'notistack';

export default function GlobalNotifications() {
  const { showNotification, notificationType, notificationTitle, notificationMessage } = useSelector(
    globalNotificationsSelectors.getGlobalNotificationState,
  );

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (showNotification) {
      enqueueSnackbar(`${notificationTitle}: ${notificationMessage}`, { variant: notificationType });
    }
  }, [showNotification]);

  return <></>;
}
