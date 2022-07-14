import React from 'react'
import { Navigate } from 'react-router-dom'

const PublicRoute = ({
  restricted = false,
  redirectTo = '/',
  children,
  isLoggedIn
}) => {
  const shouldRedirect = isLoggedIn && restricted
  return shouldRedirect ? <Navigate to={redirectTo}/> : children
}

export default PublicRoute
