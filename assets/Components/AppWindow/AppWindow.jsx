import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeNotification } from '../../redux/globalNotifications/globalNotificationsSlice';
import { styled } from '@mui/material';
import { Box, IconButton } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import styles from './styles.scss';
import CloseIcon from '@mui/icons-material/Close';
import globalNotificationsSelectors from '../../redux/globalNotifications/globalNotificationsSelectors';

const StyledSnackbarProvider = styled(SnackbarProvider)`
  &.SnackbarContent-root {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    & .SnackbarItem-message {
      text-align: justify;
    }
    & .SnackbarItem-action {
      margin-right: 0;
      margin-left: 8px;
    }
  }
`;

import { useSnackbar } from 'notistack';

function GlobalNotificationsWrapper() {
  const { showNotification, notificationType, notificationTitle, notificationMessage } = useSelector(
    globalNotificationsSelectors.getGlobalNotificationState,
  );

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (showNotification) {
      enqueueSnackbar(`${notificationTitle}: ${notificationMessage}`, {
        variant: notificationType,
        persist: notificationType === 'error',
        autoHideDuration: 3000,
      });
    }
  }, [showNotification]);

  return <></>;
}

export default function AppWindow({ children }) {
  const { notificationType, showNotification } = useSelector(globalNotificationsSelectors.getGlobalNotificationState);
  const snackBarRef = useRef(null);
  const dispatch = useDispatch();
  const handleClose = () => {
    if (showNotification) {
      dispatch(closeNotification());
    }
  };
  console.log(notificationType);
  return (
    <StyledSnackbarProvider
      onClose={handleClose}
      ref={snackBarRef}
      maxSnack={3}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      action={(id) => (
        <IconButton color="inherit" onClick={() => snackBarRef.current.closeSnackbar(id)}>
          <CloseIcon />
        </IconButton>
      )}
    >
      <Box className={styles.wrapper}>
        <Box className={styles.container}>
          {children}
          <GlobalNotificationsWrapper />
        </Box>
      </Box>
    </StyledSnackbarProvider>
  );
}
