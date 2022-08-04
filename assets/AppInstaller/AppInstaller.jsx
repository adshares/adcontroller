import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Alert } from '@mui/material';
import apiService from '../utils/apiService';
import Base from './InstallerSteps/Base/Base';
import Login from '../Components/Login/Login';
import MenuAppBar from '../Components/MenuAppBar/MenuAppBar';
import PublicRoute from '../Components/Routes/PublicRoute';
import PrivateRoute from '../Components/Routes/PrivateRoute';
import NotFoundView from '../Components/NotFound/NotFoundView';
import AppWindow from '../Components/AppWindow/AppWindow';
import Wallet from './InstallerSteps/Wallet/Wallet';
import MultiStep from '../Components/MultiStep/MultiStep';
import License from './InstallerSteps/License/License';
import Classifier from './InstallerSteps/Classifier/Classifier';
import SMTP from './InstallerSteps/SMTP/SMTP';
import Status from './InstallerSteps/Status/Status';
import InstallerStepWrapper from '../Components/InstallerStepWrapper/InstallerStepWrapper';
import Spinner from '../Components/Spinner/Spinner';

const installerSteps = [
  {
    path: 'base',
    component: Base,
    index: 1,
  },
  {
    path: 'wallet',
    component: Wallet,
    index: 2,
  },
  {
    path: 'license',
    component: License,
    index: 3,
  },
  {
    path: 'classifier',
    component: Classifier,
    index: 4,
  },
  {
    path: 'smtp',
    component: SMTP,
    index: 5,
  },
  {
    path: 'status',
    component: Status,
    index: 6,
  },
];

export default function AppInstaller() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [currentStep, setCurrentStep] = useState(null);
  const [alert, setAlert] = useState({ type: 'error', message: '', title: '' });

  useEffect(() => {
    if (token) {
      getCurrentStep();
    }
  }, [token]);

  const getCurrentStep = async () => {
    try {
      const { InstallerStep } = await apiService.getPrevStep();
      if (!InstallerStep) {
        const firstStep = installerSteps.find((el) => el.index === 1);
        setCurrentStep(firstStep.path);
        return;
      }
      const prevEl = installerSteps.find((el) => el.path === InstallerStep.toLowerCase());
      const currentEl = installerSteps.find((el) => el.index === prevEl.index + 1);
      setCurrentStep(currentEl?.path || prevEl.path);
    } catch (err) {
      setToken(localStorage.getItem('authToken'));
      setAlert({
        type: 'error',
        message: err.data.message,
        title: err.message,
      });
    }
  };

  return (
    <>
      <MenuAppBar showProtectedOptions={!!token} showIcon={!!token} setToken={setToken} />
      <AppWindow>
        <Routes>
          <Route
            path="login"
            element={
              <PublicRoute restricted isLoggedIn={!!token} redirectTo="/steps">
                <Login setToken={setToken} />
              </PublicRoute>
            }
          />
          <Route
            path="steps/*"
            element={
              <PrivateRoute isLoggedIn={!!token}>
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
    </>
  );
}
