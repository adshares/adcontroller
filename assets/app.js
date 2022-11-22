import './styles/app.scss';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { store } from './redux/store';
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './utils/theme';
import { BrowserRouter } from 'react-router-dom';
import AppController from './AppController/AppController';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppController />
      </ThemeProvider>
    </BrowserRouter>
  </Provider>,
);
