import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { closeNotification } from '../../redux/globalNotifications/globalNotificationsSlice';
import { styled } from '@mui/material';
import { Box, IconButton } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import styles from './styles.scss';
import CloseIcon from '@mui/icons-material/Close';

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

export default function AppWindow({ children }) {
  const snackBarRef = useRef(null);
  const dispatch = useDispatch();
  const handleClose = () => {
    dispatch(closeNotification());
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
      <Box className={styles.wrapper}>
        <Box className={styles.container}>{children}</Box>
      </Box>
    </StyledSnackbarProvider>
  );
}
