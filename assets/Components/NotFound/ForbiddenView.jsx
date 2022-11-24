import React from 'react';
import { Button, Typography } from '@mui/material';
import { logoutRedirect } from '../../utils/helpers';

export default function ForbiddenView() {
  const onButtonClick = () => {
    logoutRedirect();
  };
  return (
    <>
      <Typography variant="h3" component="div">
        Access denied.
      </Typography>
      <Button variant="contained" type="button" onClick={onButtonClick}>
        Switch user
      </Button>
    </>
  );
}
