import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import commonStyles from '../../styles/commonStyles.scss';

const Spinner = ({ size = 40 }) => {
  return (
    <Box className={`${commonStyles.flex} ${commonStyles.justifyCenter} ${commonStyles.alignCenter}`} sx={{ margin: 'auto' }}>
      <CircularProgress size={size} />
    </Box>
  );
};

export default Spinner;
