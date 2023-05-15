import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { logoutRedirect } from '../../utils/helpers';
import configSelectors from '../../redux/config/configSelectors';
import { AppBar, Box, Divider, IconButton, Link, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import Icon from '../Icon/Icon';
import commonStyles from '../../styles/commonStyles.scss';

export default function MenuAppBar({ mode = 'app', showProtectedOptions = false, showSideMenu, toggleSideMenu }) {
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
    <AppBar position="sticky" color="muted" sx={{ boxShadow: 'none' }}>
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
        {showProtectedOptions && mode === 'installer' && <Typography variant="h3">Installer</Typography>}
        {showProtectedOptions && mode === 'app' && (
          <IconButton size="large" color="secondary" onClick={() => toggleSideMenu(!showSideMenu)}>
            <MenuIcon />
          </IconButton>
        )}
        {showProtectedOptions && (
          <Box sx={{ ml: 'auto' }} className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
            {appData.AdPanel.Url && (
              <Link href={appData.AdPanel.Url} color="secondary" underline="hover" variant="body1">
                BACK TO ADPANEL
              </Link>
            )}
            <IconButton size="large" onClick={handleMenu} color="secondary">
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
