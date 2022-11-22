import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Alert, Box } from '@mui/material';
import apiService from '../utils/apiService';
import Base from './InstallerSteps/Base/Base';
import MenuAppBar from '../Components/MenuAppBar/MenuAppBar';
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
import commonStyles from '../styles/commonStyles.scss';
import { useSelector } from 'react-redux';
import authSelectors from '../redux/auth/authSelectors';

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
  const isLoggedIn = useSelector(authSelectors.getIsLoggedIn);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(null);
  const [alert, setAlert] = useState({ type: 'error', message: '', title: '' });

  useEffect(() => {
    getCurrentStep();
    setIsLoading(false);
  }, []);

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
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Routes>
                <Route
                  path="steps/*"
                  element={
                    currentStep ? (
                      <MultiStep currentStep={currentStep} steps={installerSteps} />
                    ) : alert.message ? (
                      <InstallerStepWrapper disabledNext hideBackButton hideNextButton>
                        <Alert severity={alert.type}>{`${alert.title}: ${alert.message}`}</Alert>
                      </InstallerStepWrapper>
                    ) : (
                      <Spinner />
                    )
                  }
                />
                <Route path="*" element={<NotFoundView />} />
                <Route path="/" element={<Navigate to="steps" />} />
              </Routes>
            </PrivateRoute>
          </AppWindow>
        </Box>
      </>
    )
  );
}
