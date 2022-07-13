import './styles/app.scss';
import React from 'react'
import ReactDOM from 'react-dom/client'
import AppController from './appController/AppController'
import { BrowserRouter } from 'react-router-dom'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <AppController/>
  </BrowserRouter>
);
