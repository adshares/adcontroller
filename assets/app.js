import './styles/app.scss';
import './styles/colors.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { store } from './redux/store';
import { Provider } from 'react-redux';
import { CssBaseline } from '@mui/material';
// import { CssBaseline, ThemeProvider } from '@mui/material';
import { ModeThemeProvider } from './hooks/ThemeProvider';
// import theme from './utils/theme';
import { BrowserRouter } from 'react-router-dom';
import AppController from './AppController/AppController';
import configuration from './controllerConfig/configuration';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <BrowserRouter basename={configuration.basePath}>
      <ModeThemeProvider>
        <CssBaseline />
        <AppController />
      </ModeThemeProvider>
    </BrowserRouter>
  </Provider>,
);
