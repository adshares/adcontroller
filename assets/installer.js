// any CSS you import will output into a single css file (app.css in this case)
import './styles/app.scss';
import React from 'react'
import ReactDOM from 'react-dom/client'
import InstallerApp from './installer/InstallerApp'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material'
import theme from './utils/theme'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <InstallerApp />
    </ThemeProvider>
  </BrowserRouter>
);
