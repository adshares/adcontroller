import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSkipFirstRenderEffect } from '../hooks';
import { checkAppAuth } from '../redux/auth/authSlice';
import authSelectors from '../redux/auth/authSelectors';
import synchronizationSelectors from '../redux/synchronization/synchronizationSelectors';
import { useLazySynchronizeConfigQuery } from '../redux/synchronization/synchronizationApi';
import { useLazyGetAppConfigQuery } from '../redux/config/configApi';
import Spinner from '../Components/Spinner/Spinner';
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
import SMTP from './General/SMTP';
import License from './General/License';
import NetworkSettings from './Network/Settings';
import SupplySettings from './Supply/Settings';
import DemandSettings from './Demand/Settings';
import UsersSettings from './Users/Settings';
import Panel from './General/Panel';
import Terms from './General/Terms';
import AdClassifier from './AdClassifier/AdClassifier';
import ConnectedStatus from './Network/ConnectedStatus';
import Events from './Events/Events';
import UsersList from './Users/UsersList';
import { Box, Dialog, DialogContent, DialogTitle } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import PercentIcon from '@mui/icons-material/Percent';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined';
import PrivacyTipOutlinedIcon from '@mui/icons-material/PrivacyTipOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LanOutlinedIcon from '@mui/icons-material/LanOutlined';
import commonStyles from '../styles/commonStyles.scss';

const appModules = [
  {
    name: 'Users',
    icon: PeopleAltOutlinedIcon,
    children: [
      {
        name: 'List of users',
        path: '/users/list',
        component: UsersList,
        icon: FormatListBulletedOutlinedIcon,
      },
      {
        name: 'Settings',
        path: '/users/settings',
        component: UsersSettings,
        icon: SettingsOutlinedIcon,
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
        icon: SettingsOutlinedIcon,
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
        icon: SettingsOutlinedIcon,
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
        icon: SettingsOutlinedIcon,
      },
      {
        name: 'Connected status',
        path: '/network/connected-status',
        component: ConnectedStatus,
        icon: LanOutlinedIcon,
      },
    ],
  },
  {
    name: 'Finance',
    icon: AttachMoneyOutlinedIcon,
    children: [
      {
        name: 'Wallet',
        path: '/finance/wallet',
        component: Wallet,
        icon: AccountBalanceWalletOutlinedIcon,
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
    icon: SettingsOutlinedIcon,
    children: [
      {
        name: 'Base',
        path: '/base',
        component: Base,
        icon: InfoOutlinedIcon,
      },
      {
        name: 'SMTP',
        path: '/smtp',
        component: SMTP,
        icon: EmailOutlinedIcon,
      },
      {
        name: 'License',
        path: '/license',
        component: License,
        icon: VpnKeyOutlinedIcon,
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
        icon: PrivacyTipOutlinedIcon,
      },
    ],
  },
  {
    name: 'AdClassifier',
    path: '/adclassifier',
    component: AdClassifier,
    icon: DashboardIcon,
  },
  {
    name: 'Events',
    path: '/events',
    component: Events,
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
    <Box className={`${commonStyles.flex}`}>
      <SideMenu enableSideMenu={isLoggedIn} showSideMenu={showSideMenu} toggleSideMenu={toggleSideMenu} menuItems={appModules} />
      <Box sx={{ flexGrow: 1, width: 'calc(100% - 292px)' }}>
        <MenuAppBar showProtectedOptions={isLoggedIn} showSideMenu={showSideMenu} toggleSideMenu={toggleSideMenu} showSideMenuIcon />
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
              <Route path="/" element={<Navigate to="/base" />} />
              <Route path="/steps/*" element={<Navigate to="/base" />} />
            </Routes>
          )}
        </AppWindow>
      </Box>
    </Box>
  );
}

export default AppController;
