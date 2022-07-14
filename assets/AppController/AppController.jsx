import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Box } from '@mui/material';
import PublicRoute from '../Components/Routes/PublicRoute';
import PrivateRoute from '../Components/Routes/PrivateRoute';
import MenuAppBar from '../Components/MenuAppBar/MenuAppBar';
import AppWindow from '../Components/AppWindow/AppWindow';
import Login from '../Components/Login/Login';
import NotFoundView from '../Components/NotFound/NotFoundView';
import SideMenu from '../Components/SideMenu/SideMenu';
import Dashboard from './Dashboard/Dashboard';
import AdPay from './AdPay/AdPay';

export default function AppController() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [showSideMenu, toggleSideMenu] = useState(false);

  return (
    <>
      <MenuAppBar
        showProtectedOptions={!!token}
        setToken={setToken}
        showSideMenu={showSideMenu}
        toggleSideMenu={toggleSideMenu}
        showSideMenuIcon
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <SideMenu enableSideMenu={!!token} showSideMenu={showSideMenu} toggleSideMenu={toggleSideMenu} />
        <AppWindow>
          <Routes>
            <Route
              path="login"
              element={
                <PublicRoute restricted isLoggedIn={!!token} redirectTo="/">
                  <Login setToken={setToken} />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <PrivateRoute isLoggedIn={!!token}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/adpay"
              element={
                <PrivateRoute isLoggedIn={!!token}>
                  <AdPay />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFoundView />} />
            <Route path="/steps/*" element={<Navigate to="/" />} />
          </Routes>
        </AppWindow>
      </Box>
    </>
  );
}
