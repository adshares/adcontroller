import React from 'react';
import { Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFoundView() {
  const navigate = useNavigate();
  const onButtonClick = () => {
    navigate('/login');
  };
  return (
    <>
      <Typography variant="h4" component="div">
        Page not found.
      </Typography>
      <Button variant="contained" type="button" onClick={onButtonClick}>
        Go back
      </Button>
    </>
  );
}
