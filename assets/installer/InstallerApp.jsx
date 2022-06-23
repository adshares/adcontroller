import React, { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Base } from './Components/Base/Base'
import LoginComponent from './Components/Login/LoginComponent'
import MenuAppBar from './Components/AppBar/AppBar'
import PublicRoute from './Components/Routes/PublicRoute'
import PrivateRoute from './Components/Routes/PrivateRoute'
import NotFoundView from './Views/NotFound/NotFoundView'

export default function InstallerApp () {
  const [token, setToken] = useState(localStorage.getItem('authToken'))

  return (
    <>
      <MenuAppBar showIcon={!!token} setToken={setToken} />
        <Routes>
            <Route element={
              <PrivateRoute isLoggedIn={!!token}>
                <Base/>
              </PrivateRoute>
              }
              path='/base'
            />
            <Route
              element={
              <PublicRoute restricted isLoggedIn={!!token}>
                <LoginComponent setToken={setToken} />
              </PublicRoute>
              }
              path='/login'
            />

          <Route path="*" element={<NotFoundView />} />
        </Routes>
    </>
  )
}
