import React from 'react';
import { Box } from '@mui/material';

import styles from './styles.scss';

export default function AppWindow({ children }) {
  return (
    <Box className={styles.wrapper}>
      <Box className={styles.container}>{children}</Box>
    </Box>
  );
}
