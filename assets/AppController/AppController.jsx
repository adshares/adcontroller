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
import Wallet from './FinanceSettingsSubMenu/Wallet/Wallet';
import Commissions from './FinanceSettingsSubMenu/Commissions/Commissions';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PercentIcon from '@mui/icons-material/Percent';
import SettingsIcon from '@mui/icons-material/Settings';
import commonStyles from './commonStyles.scss';
import Base from './GeneralSettingsSubMenu/Base/Base';

const appModules = [
  {
    name: 'Dashboard',
    path: '/',
    component: Dashboard,
    icon: DashboardIcon,
  },
  {
    name: 'General settings',
    icon: SettingsIcon,
    children: [
      {
        name: 'Base',
        path: '/base',
        component: Base,
        icon: PaymentIcon,
      },
    ],
  },

  {
    name: 'Finance settings',
    icon: AccountBalanceIcon,
    children: [
      {
        name: 'Wallet',
        path: '/wallet',
        component: Wallet,
        icon: PaymentIcon,
      },
      {
        name: 'Commissions',
        path: '/commissions',
        component: Commissions,
        icon: PercentIcon,
      },
    ],
  },
  {
    name: 'AdPay',
    path: '/adpay',
    component: AdPay,
    icon: DashboardIcon,
  },
];

const getAppPages = (appModules, isAuthenticate) => {
  const parseAppModules = (modules) => {
    const pages = [];
    for (let page of modules) {
      if (page.component) {
        pages.push(
          <Route
            key={page.name}
            path={page.path}
            element={
              <PrivateRoute isLoggedIn={isAuthenticate}>
                <page.component />
              </PrivateRoute>
            }
          />,
        );
      }
      if (page.children) {
        pages.push(...parseAppModules(page.children));
      }
    }
    return pages;
  };
  return parseAppModules(appModules);
};

export default function AppController() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [showSideMenu, toggleSideMenu] = useState(true);
  const pages = getAppPages(appModules, !!token);

  return (
    <>
      <MenuAppBar
        showProtectedOptions={!!token}
        setToken={setToken}
        showSideMenu={showSideMenu}
        toggleSideMenu={toggleSideMenu}
        showSideMenuIcon
      />
      <Box className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
        <SideMenu enableSideMenu={!!token} showSideMenu={showSideMenu} toggleSideMenu={toggleSideMenu} menuItems={appModules} />
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

            {pages}

            <Route path="*" element={<NotFoundView />} />
            <Route path="/steps/*" element={<Navigate to="/" />} />
          </Routes>
        </AppWindow>
      </Box>
    </>
  );
}
