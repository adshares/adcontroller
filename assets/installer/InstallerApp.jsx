import React, { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import apiService from './utils/apiService'
import { CircularProgress } from '@mui/material'
import Base from './Views/InstallerSteps/Base/Base'
import Login from './Views/Login/Login'
import MenuAppBar from './Components/AppBar/AppBar'
import PublicRoute from './Components/Routes/PublicRoute'
import PrivateRoute from './Components/Routes/PrivateRoute'
import NotFoundView from './Views/NotFound/NotFoundView'
import AppWindow from './Components/AppWindow/AppWindow'
import DNS from './Views/InstallerSteps/DNS/DNS'
import Wallet from './Views/InstallerSteps/Wallet/Wallet'
import MultiStep from './Views/MultiStep/MultiStep'
import License from './Views/InstallerSteps/License/License'
import Classifier from './Views/InstallerSteps/Classifier/Classifier'
import SMTP from './Views/InstallerSteps/SMTP/SMTP'
import Status from './Views/InstallerSteps/Status/Status'

const installerSteps = [
  {
    path: 'base',
    component: Base,
    index: 1,
  },
  {
    path: 'dns',
    component: DNS,
    index: 2
  },
  {
    path: 'wallet',
    component: Wallet,
    index: 3
  },
  {
    path: 'license',
    component: License,
    index: 4
  },
  {
    path: 'classifier',
    component: Classifier,
    index: 5
  },
  {
    path: 'smtp',
    component: SMTP,
    index: 6
  },
  {
    path: 'status',
    component: Status,
    index: 7
  },
]

export default function InstallerApp () {
  const [token, setToken] = useState(localStorage.getItem('authToken'))
  const [currentStep, setCurrentStep] = useState(null)

  useEffect(() => {
    if(token){
      getCurrentStep().catch(error => console.log(error))
    }
  }, [token])

  const getCurrentStep = async () => {
    const {installer_step: installerStep} = await apiService.getPrevStep()
    if(!installerStep){
      const firstStep = installerSteps.find(el => el.index === 1)
      setCurrentStep(firstStep.path)
      return
    }
    const prevEl = installerSteps.find(el => el.path === installerStep)
    const currentEl = installerSteps.find(el => el.index === prevEl.index + 1)
    setCurrentStep(currentEl.path)
  }

  return (
    <>
      <MenuAppBar showIcon={!!token} setToken={setToken}/>
      <AppWindow>
        <Routes>
          <Route
            path="login"
            element={
              <PublicRoute restricted isLoggedIn={!!token} redirectTo={'/steps'}>
                <Login setToken={setToken}/>
              </PublicRoute>
            }
          />
          <Route
            path='steps/*'
            element={
              <PrivateRoute isLoggedIn={!!token}>
                {currentStep ?
                  <MultiStep
                    currentStep={currentStep}
                    steps={installerSteps}
                  /> :
                  <CircularProgress/>
                }
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFoundView/>}/>
          <Route path="/" element={<Navigate to={'steps'}/>}/>
        </Routes>

      </AppWindow>
    </>
  )
}
