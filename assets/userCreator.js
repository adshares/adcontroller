// any CSS you import will output into a single css file (app.css in this case)
import './styles/app.scss';
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppUserCreator from './AppUserCreator/AppUserCreator';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './utils/theme';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AppUserCreator />
  </ThemeProvider>,
);
