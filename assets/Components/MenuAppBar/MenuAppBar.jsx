import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { logoutRedirect } from '../../utils/helpers';
import configSelectors from '../../redux/config/configSelectors';
import { AppBar, IconButton, Link, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';

export default function MenuAppBar({ showProtectedOptions = false, showSideMenu, toggleSideMenu, showSideMenuIcon = false }) {
  const appData = useSelector(configSelectors.getAppData);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logoutRedirect();
  };

  return (
    <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {showProtectedOptions && showSideMenuIcon && (
          <IconButton size="large" color="inherit" onClick={() => toggleSideMenu(!showSideMenu)}>
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Adshares - AdController
        </Typography>
        {showProtectedOptions && (
          <>
            {appData.AdPanel.Url && (
              <Link href={appData.AdPanel.Url} color="inherit" underline="hover" variant="button">
                Back to AdPanel
              </Link>
            )}
            <IconButton size="large" onClick={handleMenu} color="inherit">
              <AccountCircle />
            </IconButton>
            <Menu
              open={!!anchorEl}
              onClose={handleMenuClose}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
