import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAppLogout } from '../../redux/auth/authSlice';
import { AppBar, Box, Divider, IconButton, Link, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import configSelectors from '../../redux/config/configSelectors';
import commonStyles from '../../styles/commonStyles.scss';
import Icon from '../Icon/Icon';

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
          <Box sx={{ ml: 'auto' }} className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
            <Link href={appData.AdPanel.Url} color="inherit" underline="hover">
              BACK TO ADPANEL
            </Link>
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
          </Box>
        )}
      </Toolbar>
      <Divider />
    </AppBar>
  );
}
