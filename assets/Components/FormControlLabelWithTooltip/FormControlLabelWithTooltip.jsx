import React from 'react';
import { Box, FormControlLabel, Tooltip, Typography } from '@mui/material';
import commonStyles from '../../styles/commonStyles.scss';
import HelpIcon from '@mui/icons-material/Help';

export default function FormControlLabelWithTooltip({ value, control, label, tooltip }) {
  return (
    <FormControlLabel
      value={value}
      control={control}
      label={
        <Box className={`${commonStyles.flex}`}>
          <Typography variant="body1">{label}</Typography>
          <Tooltip sx={{ ml: 0.5 }} title={tooltip}>
            <HelpIcon color="primary" />
          </Tooltip>
        </Box>
      }
    />
  );
}
