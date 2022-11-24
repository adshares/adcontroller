import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { loginRedirect } from '../utils/helpers';
import authSelectors from '../redux/auth/authSelectors';
import synchronizationSelectors from '../redux/synchronization/synchronizationSelectors';
import { useGetCurrentUserQuery } from '../redux/auth/authApi';
import { useLazySynchronizeConfigQuery } from '../redux/synchronization/synchronizationApi';
import { useLazyGetAppConfigQuery } from '../redux/config/configApi';
import Spinner from '../Components/Spinner/Spinner';
import SynchronizationDialog from '../Components/SynchronizationDialog/SynchronizationDialog';
import PrivateRoute from '../Components/Routes/PrivateRoute';
import MenuAppBar from '../Components/MenuAppBar/MenuAppBar';
import AppWindow from '../Components/AppWindow/AppWindow';
import NotFoundView from '../Components/NotFound/NotFoundView';
import ForbiddenView from '../Components/NotFound/ForbiddenView';
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
import EmailIcon from '@mui/icons-material/Email';
import LanOutlinedIcon from '@mui/icons-material/LanOutlined';
import commonStyles from '../styles/commonStyles.scss';

const appModules = [
  {
    name: 'Users',
    icon: PeopleIcon,
    children: [
      {
        name: 'List of users',
        path: '/users/list',
        component: UsersList,
        icon: PeopleIcon,
      },
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
        name: 'SMTP',
        path: '/smtp',
        component: SMTP,
        icon: EmailIcon,
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
  {
    name: 'Events',
    path: '/events',
    component: Events,
    icon: DashboardIcon,
  },
];

const getAppPages = (appModules) => {
  const parseAppModules = (modules) => {
    const pages = [];
    for (let page of modules) {
      if (page.component) {
        pages.push(<Route key={page.name} path={page.path} element={<page.component />} />);
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
  const { isLoading: isUserChecking } = useGetCurrentUserQuery();
  const isLoggedIn = useSelector(authSelectors.getIsLoggedIn);
  const currentUser = useSelector(authSelectors.getUser);
  const { isSynchronizationRequired, isDataSynchronized, changedModules } = useSelector(synchronizationSelectors.getSynchronizationData);
  const [isAppInit, setAppInit] = useState(false);
  const [showSideMenu, toggleSideMenu] = useState(true);
  const pages = getAppPages(appModules);
  const [synchronizeConfig, { isFetching: isSyncInProgress }] = useLazySynchronizeConfigQuery();
  const [getAppConfig, { isFetching: isAppDataLoading }] = useLazyGetAppConfigQuery();

  useEffect(() => {
    if (!isLoggedIn) {
      loginRedirect();
      localStorage.removeItem('lastSync');
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isSynchronizationRequired && currentUser.name) {
      synchronizeConfig();
    }
  }, [isSynchronizationRequired, currentUser]);

  useEffect(() => {
    if (isDataSynchronized && currentUser.name) {
      getAppConfig();
      setAppInit(true);
    }
  }, [isDataSynchronized, currentUser]);

  return (
    <>
      <MenuAppBar
        showProtectedOptions={isLoggedIn}
        showSideMenu={showSideMenu}
        toggleSideMenu={toggleSideMenu}
        showSideMenuIcon={!!currentUser.name}
      />
      <Box className={`${commonStyles.flex} ${commonStyles.justifyCenter}`} sx={{ minHeight: 'calc(100vh - 100px)' }}>
        {isUserChecking && <Spinner />}
        <SideMenu
          enableSideMenu={isLoggedIn && !!currentUser.name}
          showSideMenu={showSideMenu}
          toggleSideMenu={toggleSideMenu}
          menuItems={appModules}
        />
        {!isUserChecking && (
          <AppWindow>
            {!isUserChecking && !currentUser.name && isLoggedIn && <ForbiddenView />}
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

            {isLoggedIn && isAppInit && isDataSynchronized && !isAppDataLoading && !isSyncInProgress && (
              <Routes>
                <Route element={<PrivateRoute isLoggedIn={isLoggedIn} available={!!currentUser.name} />}>
                  {pages}
                  <Route path="/" element={<Navigate to="/base" />} />
                  <Route path="*" element={<NotFoundView />} />
                  <Route path="/steps/*" element={<Navigate to="/base" />} />
                </Route>
              </Routes>
            )}
          </AppWindow>
        )}
      </Box>
    </>
  );
}

export default AppController;
