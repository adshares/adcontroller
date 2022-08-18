import React, { useRef } from 'react';
import { Box, IconButton } from '@mui/material';

import styles from './styles.scss';
import CloseIcon from '@mui/icons-material/Close';
import { SnackbarProvider } from 'notistack';

export default function AppWindow({ children }) {
  const snackBarRef = useRef(null);
  return (
    <SnackbarProvider
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
    </SnackbarProvider>
  );
}
