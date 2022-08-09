import './styles/app.scss';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Alert, CssBaseline, Link, ThemeProvider } from '@mui/material';
import theme from './utils/theme';
import AppWindow from './Components/AppWindow/AppWindow';
import configuration from './controllerConfig/configuration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AppWindow>
      <Alert severity="success">AdServer was successfully installed</Alert>
      <Link sx={{ mt: 2 }} variant="button" href={configuration.baseUrl} underline="hover">
        Go back
      </Link>
    </AppWindow>
  </ThemeProvider>,
);
