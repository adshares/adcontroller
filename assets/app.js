import './styles/app.scss';
import React from 'react'
import ReactDOM from 'react-dom/client'
import AppController from './appController/AppController'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material'
import theme from './utils/theme'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <AppController/>
    </ThemeProvider>
  </BrowserRouter>
);
