import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ isLoggedIn, available }) => {
  return isLoggedIn && available ? <Outlet /> : <Navigate to="/" />;
};
export default PrivateRoute;
