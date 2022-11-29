import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { logoutRedirect } from '../../utils/helpers';
import configSelectors from '../../redux/config/configSelectors';
import { AppBar, IconButton, Link, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import commonStyles from '../../styles/commonStyles.scss';
import Icon from '../Icon/Icon';

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
    <AppBar position="sticky" color="grayBg" sx={{ boxShadow: 'none' }}>
      <Toolbar>
        {!showProtectedOptions && (
          <>
            <Box sx={{ marginRight: 'auto', marginLeft: 'auto' }}>
              <Icon
                name="logo"
                sx={{
                  width: 32,
                  height: 32,
                  color: 'white.black',
                }}
              />
              <Icon
                name="adSharesText"
                sx={{
                  ml: 1,
                  mb: 1,
                  width: 79,
                  height: 9,
                  color: 'white.black',
                }}
              />
            </Box>
          </>
        )}
        {showProtectedOptions && !showSideMenuIcon && <Typography variant="h3">Installer</Typography>}
        {showProtectedOptions && showSideMenuIcon && (
          <IconButton size="large" color="inherit" onClick={() => toggleSideMenu(!showSideMenu)}>
            <MenuIcon />
          </IconButton>
        )}
        {showProtectedOptions && (
          <>
            {appData.AdPanel.Url && (
              <Link href={appData.AdPanel.Url} color="inherit" underline="hover" variant="button">
                Back to AdPanel
              </Link>
            )}
            <IconButton size="large" onClick={handleMenu} color="inherit">
              <AccountCircleOutlinedIcon />
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
