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
import RejectedDomains from './Supply/RejectedDomains';
import SupplySettings from './Supply/Settings';
import DemandSettings from './Demand/Settings';
import UsersSettings from './Users/Settings';
import Panel from './General/Panel';
import Terms from './General/Terms';
import AdClassifier from './AdClassifier/AdClassifier';
import ConnectedServers from './Network/ConnectedServers';
import Events from './Events/Events';
import UsersList from './Users/UsersList';
import { Box, Dialog, DialogContent, DialogTitle } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
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
      {
        name: 'Rejected domains',
        path: '/supply/rejected-domains',
        component: RejectedDomains,
        icon: CancelPresentationIcon,
      },
    ],
  },
  {
    name: 'Network',
    icon: SyncAltIcon,
    children: [
      {
        name: 'Connected servers',
        path: '/network/connected-servers',
        component: ConnectedServers,
        icon: LanOutlinedIcon,
      },
      {
        name: 'Settings',
        path: '/network/settings',
        component: NetworkSettings,
        icon: SettingsOutlinedIcon,
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

const getAppPages = (appModules) => {
  const pages = [];
  for (let page of appModules) {
    if (page.component) {
      pages.push(<Route key={page.name} path={page.path} element={<page.component />} />);
    }
    if (page.children) {
      pages.push(...getAppPages(page.children));
    }
  }
  return pages;
};

function AppController() {
  const { isLoading: isUserChecking } = useGetCurrentUserQuery();
  const isLoggedIn = useSelector(authSelectors.getIsLoggedIn);
  const currentUser = useSelector(authSelectors.getUser);
  const { isSynchronizationRequired, isDataSynchronized, changedModules } = useSelector(synchronizationSelectors.getSynchronizationData);
  const [showSideMenu, toggleSideMenu] = useState(true);
  const pages = getAppPages(appModules);
  const [synchronizeConfig, { isFetching: isSyncInProgress }] = useLazySynchronizeConfigQuery();
  const [getAppConfig, { isFetching: isAppDataLoading, isSuccess: isAppDataLoadingSuccess }] = useLazyGetAppConfigQuery();

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
    }
  }, [isDataSynchronized, currentUser]);

  return (
    <Box className={`${commonStyles.flex}`}>
      <SideMenu
        enableSideMenu={isLoggedIn && !!currentUser.name}
        showSideMenu={showSideMenu}
        toggleSideMenu={toggleSideMenu}
        menuItems={appModules}
      />
      <Box sx={{ flexGrow: 1, width: 'calc(100% - 292px)' }}>
        <MenuAppBar showProtectedOptions={!!currentUser.name} showSideMenu={showSideMenu} toggleSideMenu={toggleSideMenu} />
        {isUserChecking && <Spinner />}
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

            {isLoggedIn && isAppDataLoadingSuccess && isDataSynchronized && !isAppDataLoading && !isSyncInProgress && (
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
    </Box>
  );
}

export default AppController;
