import './styles/app.scss';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Alert, CssBaseline, ThemeProvider } from '@mui/material';
import theme from './utils/theme';
import AppWindow from './Components/AppWindow/AppWindow';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AppWindow>
      <Alert severity="success">AdServer was successfully installed</Alert>
    </AppWindow>
  </ThemeProvider>,
);
