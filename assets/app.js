// any CSS you import will output into a single css file (app.css in this case)
import './styles/app.scss';
import React from 'react'
import ReactDOM from 'react-dom/client'
import AdminComponent from './AdminComponent'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AdminComponent />);
