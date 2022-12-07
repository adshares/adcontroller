import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeNotification } from '../../redux/globalNotifications/globalNotificationsSlice';
import { styled } from '@mui/material';
import { Box, IconButton } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import styles from './styles.scss';
import CloseIcon from '@mui/icons-material/Close';
import globalNotificationsSelectors from '../../redux/globalNotifications/globalNotificationsSelectors';

const StyledSnackbarProvider = styled(SnackbarProvider)(({ theme }) => ({
  '&.SnackbarContent-root': {
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    borderRadius: '8px',
    fontSize: '16px',
    fontVariationSettings: '"wght" 700',

    '&.SnackbarItem-variantError': {
      backgroundColor: theme.palette.sunset.light,
      color: theme.palette.sunset.main,
    },

    '&.SnackbarItem-variantSuccess': {
      backgroundColor: theme.palette.freshGrass.light,
      color: theme.palette.freshGrass.main,
    },

    '&.SnackbarItem-variantWarning': {
      backgroundColor: theme.palette.sun.light,
      color: theme.palette.sun.main,
    },

    '& .SnackbarItem-message': {
      textAlign: 'justify',
    },
    '& .SnackbarItem-action': {
      marginRight: 0,
      marginLeft: '8px',
    },
  },
}));

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
  const { showNotification } = useSelector(globalNotificationsSelectors.getGlobalNotificationState);
  const snackBarRef = useRef(null);
  const dispatch = useDispatch();
  const handleClose = () => {
    if (showNotification) {
      dispatch(closeNotification());
    }
  };
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
      <Box className={styles.container}>
        {children}
        <GlobalNotificationsWrapper />
      </Box>
    </StyledSnackbarProvider>
  );
}
