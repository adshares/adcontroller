import React, { useState } from 'react';
import apiService from '../utils/apiService';
import { Alert, Box, Button, Card, CardContent, CardHeader, Collapse, IconButton, TextField, Typography } from '@mui/material';
import logo from '../img/logo.png';
import CloseIcon from '@mui/icons-material/Close';
import MenuAppBar from '../Components/MenuAppBar/MenuAppBar';
import AppWindow from '../Components/AppWindow/AppWindow';
import styles from './styles.scss';

export const AppUserCreator = () => {
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
        <Card className={styles.container}>
          <CardContent>
            <Box
              component="img"
              src={logo}
              height="70px"
              width="70px"
              sx={{
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            />
          </CardContent>
          <CardHeader title="Create account" titleTypographyProps={{ align: 'center' }} />

          <CardContent>
            <Box onSubmit={handleSubmit} component="form">
              <TextField
                variant="standard"
                margin="normal"
                required
                fullWidth
                type="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                onChange={handleInputChange}
                inputProps={{ autocomplete: 'off' }}
              />
              <TextField
                variant="standard"
                margin="normal"
                required
                fullWidth
                type="password"
                label="Password"
                name="password"
                onChange={handleInputChange}
                inputProps={{ autocomplete: 'off' }}
              />
              <Button type="submit" fullWidth variant="contained" color="primary">
                Create
              </Button>
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
};
