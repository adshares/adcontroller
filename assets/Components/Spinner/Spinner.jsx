import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import styles from './styles.scss';

const Spinner = ({ size = 40 }) => {
  return (
    <Box className={styles.container}>
      <CircularProgress size={size} />
    </Box>
  );
};

export default Spinner;
