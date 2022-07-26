import './styles/app.scss';
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppController from './AppController/AppController';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './utils/theme';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter basename={process.env.PUBLIC_URL}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppController />
    </ThemeProvider>
  </BrowserRouter>,
);
