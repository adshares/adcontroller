import React, { useState } from 'react'
import { AppBar, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material'
import { AccountCircle } from '@mui/icons-material'
import MenuIcon from '@mui/icons-material/Menu';
import apiService from '../../utils/apiService'

export default function MenuAppBar ({
  showProtectedOptions,
  setToken,
  showSideMenu,
  toggleSideMenu,
  showSideMenuIcon = false
}) {
  const [anchorEl, setAnchorEl] = useState(null)

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    apiService.logout()
    handleMenuClose()
    setToken(localStorage.getItem('authToken'))
  }

  return (
    <AppBar position="sticky" sx={{zIndex: (theme) => theme.zIndex.drawer + 1}}>
      <Toolbar>
        {showProtectedOptions && showSideMenuIcon && (
          <IconButton
            size="large"
            color="inherit"
            onClick={() => toggleSideMenu(!showSideMenu)}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Adshares - AdController
        </Typography>
        {showProtectedOptions && (
          <>
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle/>
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
  )
}
