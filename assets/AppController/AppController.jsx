import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setAppLogin, setAppLogout } from '../redux/auth/authSlice';
import authSelectors from '../redux/auth/authSelectors';
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
import Base from './GeneralSettingsSubMenu/Base/Base';
import License from './GeneralSettingsSubMenu/License/License';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PercentIcon from '@mui/icons-material/Percent';
import SettingsIcon from '@mui/icons-material/Settings';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import commonStyles from './commonStyles.scss';

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
        icon: AlternateEmailIcon,
      },
      {
        name: 'License',
        path: '/license',
        component: License,
        icon: VpnKeyIcon,
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
        icon: AccountBalanceWalletIcon,
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

function AppController() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(authSelectors.getIsLoggedIn);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [showSideMenu, toggleSideMenu] = useState(true);
  const pages = getAppPages(appModules, isLoggedIn);

  useEffect(() => {
    if (!token) {
      dispatch(setAppLogout());
      setIsLoading(false);
      return;
    }
    dispatch(setAppLogin(token));
    setIsLoading(false);
  }, [token]);

  return (
    !isLoading && (
      <>
        <MenuAppBar
          showProtectedOptions={isLoggedIn}
          setToken={setToken}
          showSideMenu={showSideMenu}
          toggleSideMenu={toggleSideMenu}
          showSideMenuIcon
        />
        <Box className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
          <SideMenu enableSideMenu={isLoggedIn} showSideMenu={showSideMenu} toggleSideMenu={toggleSideMenu} menuItems={appModules} />
          <AppWindow>
            <Routes>
              <Route
                path="login"
                element={
                  <PublicRoute restricted isLoggedIn={isLoggedIn} redirectTo="/">
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
    )
  );
}

export default AppController;