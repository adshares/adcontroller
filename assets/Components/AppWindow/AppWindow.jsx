import React, { useRef } from 'react';
import { Box, IconButton } from '@mui/material';

import styles from './styles.scss';
import CloseIcon from '@mui/icons-material/Close';
import { SnackbarProvider } from 'notistack';
import { styled } from '@mui/material';

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
  return (
    <StyledSnackbarProvider
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
