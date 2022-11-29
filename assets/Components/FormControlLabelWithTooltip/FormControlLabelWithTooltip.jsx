import React from 'react';
import { Box, FormControlLabel, Tooltip, Typography } from '@mui/material';
import commonStyles from '../../styles/commonStyles.scss';
import InfoIcon from '@mui/icons-material/Info';

export default function FormControlLabelWithTooltip({ value, control, label, tooltip }) {
  return (
    <FormControlLabel
      value={value}
      control={control}
      label={
        <Box className={`${commonStyles.flex}`}>
          <Typography variant="body1">{label}</Typography>
          <Tooltip sx={{ ml: 1 }} title={tooltip}>
            <InfoIcon color="secondary" />
          </Tooltip>
        </Box>
      }
    />
  );
}
