import React, { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Base from './Views/Base/Base'
import Login from './Views/Login/Login'
import MenuAppBar from './Components/AppBar/AppBar'
import PublicRoute from './Components/Routes/PublicRoute'
import PrivateRoute from './Components/Routes/PrivateRoute'
import NotFoundView from './Views/NotFound/NotFoundView'
import AppWindow from './Components/AppWindow/AppWindow'
import Dns from './Views/Dns/Dns'
import apiService from './utils/apiService'

const installerSteps = {
  base: {
    name: 'base',
    label: 'Base', //delete if no use
    component: Base,
    path: '/base',
    completed: false,
  },
  dns: {
    name: 'dns',
    label: 'Dns', //delete if no use
    component: Dns,
    path: '/dns',
    completed: false
  },
}

export default function InstallerApp () {
  const [token, setToken] = useState(localStorage.getItem('authToken'))
  console.log(installerSteps)

  useEffect(() => {
    if(token){
      apiService.getCurrentStep().then(response => console.log(response))
    }
  }, [token])

  return (
    <>
      <MenuAppBar showIcon={!!token} setToken={setToken} />
      <AppWindow>
        <Routes>
          <Route
            element={
            <PrivateRoute isLoggedIn={!!token}>
              <Base/>
            </PrivateRoute>
            }
            path='/base'
          />
          <Route
            element={
              <PrivateRoute isLoggedIn={!!token}>
                <Dns/>
              </PrivateRoute>
            }
            path='/dns'
          />
          <Route
            element={
              <PublicRoute restricted isLoggedIn={!!token}>
                <Login setToken={setToken} />
              </PublicRoute>
            }
            path='/login'
          />

          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </AppWindow>
    </>
  )
}
