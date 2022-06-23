import React from 'react'
import { Navigate } from 'react-router-dom';

const PublicRoute = ({
  component: Component,
  restricted = false,
  redirectTo = '/base',
  children,
  isLoggedIn
}) => {
  const shouldRedirect = isLoggedIn && restricted;
  return shouldRedirect ? <Navigate to={redirectTo} /> : children;
};

export default PublicRoute;
