import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAppLogout } from '../../redux/auth/authSlice';
import { AppBar, Box, Divider, IconButton, Link, Menu, MenuItem, Toolbar } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import configSelectors from '../../redux/config/configSelectors';

export default function MenuAppBar({ showProtectedOptions, showSideMenu, toggleSideMenu, showSideMenuIcon = false }) {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(setAppLogout());
    handleMenuClose();
  };

  return (
    <AppBar position="sticky" color="grayBg" sx={{ boxShadow: 'none' }}>
      <Toolbar>
        {showProtectedOptions && showSideMenuIcon && (
          <IconButton size="large" color="inherit" onClick={() => toggleSideMenu(!showSideMenu)}>
            <MenuIcon />
          </IconButton>
        )}
        {showProtectedOptions && (
          <Box sx={{ ml: 'auto' }}>
            <Link href={appData.AdPanel.Url} color="inherit" underline="hover" variant="button">
              Back to AdPanel
            </Link>
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
          </Box>
        )}
      </Toolbar>
      <Divider />
    </AppBar>
  );
}
