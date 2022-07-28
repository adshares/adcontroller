import React, { useState } from 'react';
import { useLoginUserMutation } from '../../redux/auth/authApi';
import { useDispatch } from 'react-redux';
import { setAppLogin } from '../../redux/auth/authSlice';
import { Alert, Box, Button, Card, CardContent, CardHeader, Collapse, IconButton, Link, TextField, Typography } from '@mui/material';
import styles from './styles.scss';
import logo from '../../img/logo.png';
import CloseIcon from '@mui/icons-material/Close';

export default function Login() {
  const dispatch = useDispatch();
  const [loginUser, { isLoading }] = useLoginUserMutation();
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
      const response = await loginUser({ email, password }).unwrap();
      if (response.token) {
        dispatch(setAppLogin(response.token));
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.data.message,
        title: 'Authorization error',
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
      <CardHeader title="Please login" titleTypographyProps={{ align: 'center' }} />

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
            onChange={handleInputChange}
            inputProps={{ autoComplete: 'off' }}
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
            inputProps={{ autoComplete: 'off' }}
          />
          <Button type="submit" fullWidth variant="contained" color="primary" disabled={isLoading}>
            Login
          </Button>
        </Box>
        <Box className={styles.link}>
          <Link href="https://web3ads.net/auth/forgotten-password" variant="body1" underline="hover" target="_blank" align="center">
            Forgot password?
          </Link>
        </Box>
      </CardContent>
      <Collapse in={!!alert.message}>
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
  );
}
