import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSkipFirstRenderEffect } from '../hooks';
import { checkAppAuth } from '../redux/auth/authSlice';
import authSelectors from '../redux/auth/authSelectors';
import synchronizationSelectors from '../redux/synchronization/synchronizationSelectors';
import { useLazySynchronizeConfigQuery } from '../redux/synchronization/synchronizationApi';
import { useLazyGetAppConfigQuery } from '../redux/config/configApi';
import SynchronizationDialog from '../Components/SynchronizationDialog/SynchronizationDialog';
import PublicRoute from '../Components/Routes/PublicRoute';
import PrivateRoute from '../Components/Routes/PrivateRoute';
import MenuAppBar from '../Components/MenuAppBar/MenuAppBar';
import AppWindow from '../Components/AppWindow/AppWindow';
import Login from '../Components/Login/Login';
import NotFoundView from '../Components/NotFound/NotFoundView';
import SideMenu from '../Components/SideMenu/SideMenu';
import Wallet from './Finance/Wallet';
import Commissions from './Finance/Commissions';
import Base from './General/Base';
import License from './General/License';
import NetworkSettings from './Network/Settings';
import SupplySettings from './Supply/Settings';
import DemandSettings from './Demand/Settings';
import UsersSettings from './Users/Settings';
import Panel from './General/Panel';
import Terms from './General/Terms';
import AdClassifier from './AdClassifier/AdClassifier';
import { Box, Dialog, DialogContent, DialogTitle } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PercentIcon from '@mui/icons-material/Percent';
import SettingsIcon from '@mui/icons-material/Settings';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import InfoIcon from '@mui/icons-material/Info';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import PeopleIcon from '@mui/icons-material/People';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import commonStyles from '../styles/commonStyles.scss';
import Spinner from '../Components/Spinner/Spinner';

const appModules = [
  {
    name: 'Users',
    icon: PeopleIcon,
    children: [
      {
        name: 'Settings',
        path: '/users/settings',
        component: UsersSettings,
        icon: SettingsIcon,
      },
    ],
  },
  {
    name: 'Demand',
    icon: TrendingFlatIcon,
    children: [
      {
        name: 'Settings',
        path: '/demand/settings',
        component: DemandSettings,
        icon: SettingsIcon,
      },
    ],
  },
  {
    name: 'Supply',
    icon: TrendingFlatIcon,
    rotateIcon: '180deg',
    children: [
      {
        name: 'Settings',
        path: '/supply/settings',
        component: SupplySettings,
        icon: SettingsIcon,
      },
    ],
  },
  {
    name: 'Network',
    icon: SyncAltIcon,
    children: [
      {
        name: 'Settings',
        path: '/network/settings',
        component: NetworkSettings,
        icon: SettingsIcon,
      },
    ],
  },
  {
    name: 'Finance',
    icon: AccountBalanceIcon,
    children: [
      {
        name: 'Wallet',
        path: '/finance/wallet',
        component: Wallet,
        icon: AccountBalanceWalletIcon,
      },
      {
        name: 'Commissions',
        path: '/finance/commissions',
        component: Commissions,
        icon: PercentIcon,
      },
    ],
  },
  {
    name: 'General',
    icon: SettingsIcon,
    children: [
      {
        name: 'Base',
        path: '/base',
        component: Base,
        icon: InfoIcon,
      },
      {
        name: 'License',
        path: '/license',
        component: License,
        icon: VpnKeyIcon,
      },
      {
        name: 'Panel',
        path: '/panel',
        component: Panel,
        icon: DisplaySettingsIcon,
      },
      {
        name: 'Privacy & Terms',
        path: '/terms',
        component: Terms,
        icon: PrivacyTipIcon,
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
  const isLoggedIn = useSelector(authSelectors.getIsLoggedIn);
  const { isSynchronizationRequired, isDataSynchronized, changedModules } = useSelector(synchronizationSelectors.getSynchronizationData);
  const dispatch = useDispatch();
  const [isAppInit, setAppInit] = useState(false);
  const [showSideMenu, toggleSideMenu] = useState(true);
  const pages = getAppPages(appModules, isLoggedIn);
  const [synchronizeConfig, { isFetching: isSyncInProgress }] = useLazySynchronizeConfigQuery();
  const [getAppConfig, { isFetching: isAppDataLoading }] = useLazyGetAppConfigQuery();

  useEffect(() => {
    if (token) {
      dispatch(checkAppAuth());
    }
    setAppInit(true);
  }, [token]);

  useSkipFirstRenderEffect(() => {
    if (token && isSynchronizationRequired) {
      synchronizeConfig();
    }
  }, [token, isSynchronizationRequired]);

  useEffect(() => {
    if (token && isDataSynchronized) {
      getAppConfig();
    }
  }, [token, isDataSynchronized]);

  return (
    <>
      <MenuAppBar showProtectedOptions={isLoggedIn} showSideMenu={showSideMenu} toggleSideMenu={toggleSideMenu} showSideMenuIcon />
      <Box className={`${commonStyles.flex} ${commonStyles.justifyCenter}`} sx={{ minHeight: 'calc(100vh - 100px)' }}>
        <SideMenu enableSideMenu={isLoggedIn} showSideMenu={showSideMenu} toggleSideMenu={toggleSideMenu} menuItems={appModules} />
        <AppWindow>
          <SynchronizationDialog
            isSyncInProgress={isSyncInProgress}
            isSynchronizationRequired={isSynchronizationRequired}
            isDataSynchronized={isDataSynchronized}
            changedModules={changedModules}
          />

          {isAppDataLoading && (
            <Dialog open={isAppDataLoading}>
              <DialogTitle>App data loading</DialogTitle>

              <DialogContent>
                <Spinner />
              </DialogContent>
            </Dialog>
          )}

          {isAppInit && isDataSynchronized && !isAppDataLoading && !isSyncInProgress && (
            <Routes>
              <Route
                path="login"
                element={
                  <PublicRoute restricted isLoggedIn={isLoggedIn} redirectTo="/base">
                    <Login />
                  </PublicRoute>
                }
              />
              {pages}
              <Route path="*" element={<NotFoundView />} />
              <Route path="/steps/*" element={<Navigate to="/base" />} />
            </Routes>
          )}
        </AppWindow>
      </Box>
    </>
  );
}

export default AppController;
