// any CSS you import will output into a single css file (app.css in this case)
import './styles/app.scss';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppUserCreator } from './AppUserCreator/AppUserCreator';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './utils/theme';
import { store } from './redux/store';
import { Provider } from 'react-redux';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppUserCreator />
    </ThemeProvider>
  </Provider>,
);
