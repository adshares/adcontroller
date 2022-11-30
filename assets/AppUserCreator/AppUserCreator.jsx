import React, { useState } from 'react';
import apiService from '../utils/apiService';
import { Alert, Box, Button, Card, CardContent, CardHeader, Collapse, IconButton, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuAppBar from '../Components/MenuAppBar/MenuAppBar';
import AppWindow from '../Components/AppWindow/AppWindow';
import commonStyles from '../styles/commonStyles.scss';

export default function AppUserCreator() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState({
    type: '',
    message: '',
    title: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.createUser({
        email,
        password,
      });
      window.location.reload();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.data.message,
        title: err.message,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setAlert({
      type: '',
      message: '',
      title: '',
    });

    switch (name) {
      case 'email':
        setEmail(value);
        break;

      case 'password':
        setPassword(value);
        break;

      default:
        return;
    }
  };
  return (
    <>
      <MenuAppBar />
      <AppWindow>
        <Card sx={{ width: '500px', height: 'calc(100vh - 20rem)', minHeight: '450px', padding: '30px 60px', mt: 10 }}>
          <CardHeader title="Please login" titleTypographyProps={{ align: 'center', variant: 'h3' }} />

          <CardContent>
            <Box onSubmit={handleSubmit} component="form">
              <TextField
                sx={{ mb: 3 }}
                customvariant="highLabel"
                color="secondary"
                required
                fullWidth
                type="email"
                label="Email Address"
                name="email"
                onChange={handleInputChange}
                inputProps={{ autoComplete: 'off' }}
              />
              <TextField
                sx={{ mb: 3 }}
                customvariant="highLabel"
                color="secondary"
                required
                fullWidth
                type="password"
                label="Password"
                name="password"
                onChange={handleInputChange}
                inputProps={{ autoComplete: 'off' }}
              />
              <Box className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
                <Button type="submit" variant="contained" color="primary">
                  Create
                </Button>
              </Box>
            </Box>
          </CardContent>
          <Collapse in={!!alert.title}>
            <Alert
              severity={alert.type || 'error'}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setAlert({
                      type: '',
                      message: '',
                      title: '',
                    });
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              <Typography variant="body2">
                {alert.title}: {alert.message}
              </Typography>
            </Alert>
          </Collapse>
        </Card>
      </AppWindow>
    </>
  );
}
