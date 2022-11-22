import React, { useEffect } from 'react';
import Spinner from '../Spinner/Spinner';

const PrivateRoute = ({ children, isLoggedIn }) => {
  useEffect(() => {
    if (!isLoggedIn) {
      window.open('/oauth/redirect', '_self');
      localStorage.removeItem('lastSync');
    }
  }, [isLoggedIn]);
  return isLoggedIn ? children : <Spinner />;
};
export default PrivateRoute;
