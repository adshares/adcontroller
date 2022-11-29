import React, { useState } from 'react';
import { useLoginUserMutation } from '../../redux/auth/authApi';
import { useDispatch } from 'react-redux';
import { setAppLogin } from '../../redux/auth/authSlice';
import { Alert, Box, Button, Card, CardContent, CardHeader, Collapse, IconButton, Link, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import commonStyles from '../../styles/commonStyles.scss';

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
          />
          <Box className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
            <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
              Login
            </Button>
          </Box>
        </Box>
        <Box sx={{ mt: 3 }} className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
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
