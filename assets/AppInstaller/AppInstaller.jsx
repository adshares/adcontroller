import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Alert, Box } from '@mui/material';
import apiService from '../utils/apiService';
import Base from './InstallerSteps/Base/Base';
import Login from '../Components/Login/Login';
import MenuAppBar from '../Components/MenuAppBar/MenuAppBar';
import PublicRoute from '../Components/Routes/PublicRoute';
import PrivateRoute from '../Components/Routes/PrivateRoute';
import NotFoundView from '../Components/NotFound/NotFoundView';
import AppWindow from '../Components/AppWindow/AppWindow';
import DNS from './InstallerSteps/DNS/DNS';
import Wallet from './InstallerSteps/Wallet/Wallet';
import MultiStep from '../Components/MultiStep/MultiStep';
import License from './InstallerSteps/License/License';
import Classifier from './InstallerSteps/Classifier/Classifier';
import SMTP from './InstallerSteps/SMTP/SMTP';
import Status from './InstallerSteps/Status/Status';
import InstallerStepWrapper from '../Components/InstallerStepWrapper/InstallerStepWrapper';
import Spinner from '../Components/Spinner/Spinner';
import commonStyles from '../AppController/common/commonStyles.scss';
import { useDispatch, useSelector } from 'react-redux';
import authSelectors from '../redux/auth/authSelectors';
import { checkAppAuth } from '../redux/auth/authSlice';

const installerSteps = [
  {
    path: 'base',
    component: Base,
    index: 1,
  },
  {
    path: 'dns',
    component: DNS,
    index: 2,
  },
  {
    path: 'wallet',
    component: Wallet,
    index: 3,
  },
  {
    path: 'license',
    component: License,
    index: 4,
  },
  {
    path: 'classifier',
    component: Classifier,
    index: 5,
  },
  {
    path: 'smtp',
    component: SMTP,
    index: 6,
  },
  {
    path: 'status',
    component: Status,
    index: 7,
  },
];

export default function AppInstaller() {
  const token = useSelector(authSelectors.getToken);
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(authSelectors.getIsLoggedIn);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(null);
  const [alert, setAlert] = useState({ type: 'error', message: '', title: '' });

  useEffect(() => {
    dispatch(checkAppAuth());
    if (token) {
      getCurrentStep();
    }
    setIsLoading(false);
  }, [token]);

  const getCurrentStep = async () => {
    try {
      const { installer_step } = await apiService.getPrevStep();
      if (!installer_step) {
        const firstStep = installerSteps.find((el) => el.index === 1);
        setCurrentStep(firstStep.path);
        return;
      }
      const prevEl = installerSteps.find((el) => el.path === installer_step);
      const currentEl = installerSteps.find((el) => el.index === prevEl.index + 1);
      setCurrentStep(currentEl?.path || prevEl.path);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.data.message,
        title: err.message,
      });
    }
  };

  return (
    !isLoading && (
      <>
        <MenuAppBar showProtectedOptions={isLoggedIn} showIcon={isLoggedIn} />
        <Box className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
          <AppWindow>
            <Routes>
              <Route
                path="login"
                element={
                  <PublicRoute restricted isLoggedIn={isLoggedIn} redirectTo="/steps">
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="steps/*"
                element={
                  <PrivateRoute isLoggedIn={isLoggedIn}>
                    {currentStep ? (
                      <MultiStep currentStep={currentStep} steps={installerSteps} />
                    ) : alert.message ? (
                      <InstallerStepWrapper disabledNext hideBackButton hideNextButton>
                        <Alert severity={alert.type}>{`${alert.title}: ${alert.message}`}</Alert>
                      </InstallerStepWrapper>
                    ) : (
                      <Spinner />
                    )}
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NotFoundView />} />
              <Route path="/" element={<Navigate to="steps" />} />
            </Routes>
          </AppWindow>
        </Box>
      </>
    )
  );
}
