import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { checkAppAuth } from '../redux/auth/authSlice';
import authSelectors from '../redux/auth/authSelectors';
import PublicRoute from '../Components/Routes/PublicRoute';
import PrivateRoute from '../Components/Routes/PrivateRoute';
import MenuAppBar from '../Components/MenuAppBar/MenuAppBar';
import AppWindow from '../Components/AppWindow/AppWindow';
import Login from '../Components/Login/Login';
import NotFoundView from '../Components/NotFound/NotFoundView';
import SideMenu from '../Components/SideMenu/SideMenu';
import Wallet from './FinanceSettingsSubMenu/Wallet/Wallet';
import Commissions from './FinanceSettingsSubMenu/Commissions/Commissions';
import Base from './GeneralSettingsSubMenu/Base/Base';
import License from './GeneralSettingsSubMenu/License/License';
import Network from './GeneralSettingsSubMenu/Network/Network';
import Supply from './GeneralSettingsSubMenu/Supply/Supply';
import Demand from './GeneralSettingsSubMenu/Demand/Demand';
import Settings from './Users/Settings/Settings';
import Panel from './GeneralSettingsSubMenu/Panel/Panel';
import AdClassifier from './AdClassifier/AdClassifier';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PercentIcon from '@mui/icons-material/Percent';
import SettingsIcon from '@mui/icons-material/Settings';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import commonStyles from './common/commonStyles.scss';
import { setConfig } from '../redux/config/configSlice';
import { useGetAppConfigQuery } from '../redux/config/configApi';
import { skipToken } from '@reduxjs/toolkit/query';

const appModules = [
  {
    name: 'Users',
    icon: ManageAccountsIcon,
    children: [
      {
        name: 'Settings',
        path: '/settings',
        component: Settings,
        icon: ManageAccountsIcon,
      },
    ],
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
      {
        name: 'Network',
        path: '/network',
        component: Network,
        icon: SyncAltIcon,
      },
      {
        name: 'Demand',
        path: '/demand',
        component: Demand,
        icon: TrendingFlatIcon,
      },
      {
        name: 'Supply',
        path: '/supply',
        component: Supply,
        icon: TrendingFlatIcon,
        rotateIcon: '180deg',
      },
      {
        name: 'Panel',
        path: '/panel',
        component: Panel,
        icon: DisplaySettingsIcon,
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
    name: 'AdClassifier',
    path: '/adclassifier',
    component: AdClassifier,
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
  const token = useSelector(authSelectors.getToken);
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(authSelectors.getIsLoggedIn);
  const [isLoading, setIsLoading] = useState(true);
  const [showSideMenu, toggleSideMenu] = useState(true);
  const pages = getAppPages(appModules, isLoggedIn);
  const { data: appData, isLoading: appDataLoading } = useGetAppConfigQuery(token ?? skipToken);

  useEffect(() => {
    dispatch(checkAppAuth());
    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    if (isLoggedIn && appData) {
      dispatch(setConfig(appData.data));
    }
  }, [appDataLoading, isLoggedIn]);

  return (
    !isLoading &&
    !appDataLoading && (
      <>
        <MenuAppBar showProtectedOptions={isLoggedIn} showSideMenu={showSideMenu} toggleSideMenu={toggleSideMenu} showSideMenuIcon />
        <Box className={`${commonStyles.flex} ${commonStyles.justifyCenter}`} sx={{ minHeight: 'calc(100vh - 100px)' }}>
          <SideMenu enableSideMenu={isLoggedIn} showSideMenu={showSideMenu} toggleSideMenu={toggleSideMenu} menuItems={appModules} />
          <AppWindow>
            <Routes>
              <Route
                path="login"
                element={
                  <PublicRoute restricted isLoggedIn={isLoggedIn} redirectTo="/">
                    <Login />
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
