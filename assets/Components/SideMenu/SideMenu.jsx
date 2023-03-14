import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import configSelectors from '../../redux/config/configSelectors';
import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import MuiAccordion from '@mui/material/Accordion';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { AccordionDetails, AccordionSummary, Link, Typography } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import commonStyles from '../../styles/commonStyles.scss';
import Icon from '../Icon/Icon';

const drawerWidth = 292;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 8px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 8px)`,
  },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
  '& .MuiDrawer-paper::-webkit-scrollbar': {
    backgroundColor: theme.palette.deep.dark,
    width: '8px',
    borderRadius: '10px',
  },
  '& .MuiDrawer-paper::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.blue.main,
    borderRadius: '10px',
  },
}));

const Accordion = styled(MuiAccordion, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme }) => ({
  '&': {
    boxShadow: 'none',
  },
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

const getMappedMenuItems = (items) => {
  const [expanded, setExpanded] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    items.forEach((parentItem) => {
      if (parentItem.children) {
        parentItem.children.forEach((childItem) => {
          if (childItem.path === location.pathname) {
            setExpanded((prevState) => [...prevState, parentItem.name]);
          }
        });
      }
    });
  }, [location]);

  const handleChange = (itemName) => (event, isExpanded) => {
    if (isExpanded) {
      setExpanded((prev) => [...prev, itemName]);
    } else if (!isExpanded) {
      setExpanded((prev) => prev.filter((e) => e !== itemName));
    }
  };

  return items.map((item) => {
    return (
      <ListItem key={item.name} disablePadding>
        {item.children ? (
          <Accordion
            sx={{ backgroundColor: 'transparent' }}
            expanded={expanded.includes(item.name)}
            onChange={handleChange(item.name)}
            disableGutters
            square
          >
            <AccordionSummary
              sx={{
                pl: 3,
                pr: 3,
                '&:hover': {
                  backgroundColor: 'rgba(0, 47, 54, 0.5)',
                },
              }}
              expandIcon={<ArrowDropDownIcon color="white" />}
            >
              <ListItemIcon>
                {React.createElement(item.icon, {
                  sx: { transform: item.rotateIcon && `rotate(${item.rotateIcon})` },
                  color: 'white',
                })}
              </ListItemIcon>
              <Typography sx={{ color: 'white.main', fontVariationSettings: '"wght" 600' }}>{item.name}</Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                backgroundColor: 'deep.main',
                boxShadow: 'inset 0px 4px 4px rgba(0, 0, 0, 0.25)',
                pl: 0,
                pr: 0,
                pt: 1,
                pb: 1,
              }}
            >
              <List disablePadding>
                {item.children.map((children) => (
                  <ListItemButton
                    key={item.name + children.name}
                    className={`${commonStyles.flex} ${commonStyles.alignCenter}`}
                    sx={{ padding: '8px 24px', '&:hover': { backgroundColor: 'rgba(0, 61, 77, 0.5)' } }}
                    onClick={() => navigate(children.path)}
                  >
                    <ListItemIcon>
                      {React.createElement(children.icon, {
                        sx: { transform: children.rotateIcon && `rotate(${children.rotateIcon})` },
                        color: children.path === location.pathname ? 'blue' : 'white',
                      })}
                    </ListItemIcon>
                    <ListItemText
                      primary={children.name}
                      primaryTypographyProps={{
                        sx: {
                          color: children.path === location.pathname ? 'blue.main' : 'white.main',
                          margin: 0,
                          fontVariationSettings: '"wght" 500',
                        },
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ) : (
          <ListItemButton
            className={`${commonStyles.flex} ${commonStyles.alignCenter}`}
            sx={{ padding: '8px 24px', '&:hover': { backgroundColor: 'rgba(0, 47, 54, 0.5)' } }}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>
              {React.createElement(item.icon, {
                sx: { transform: item.rotateIcon && `rotate(${item.rotateIcon})` },
                color: item.path === location.pathname ? 'blue' : 'white',
              })}
            </ListItemIcon>
            <ListItemText
              primary={item.name}
              primaryTypographyProps={{
                sx: {
                  color: item.path === location.pathname ? 'blue.main' : 'white.main',
                  margin: 0,
                  fontVariationSettings: '"wght" 600',
                },
              }}
            />
          </ListItemButton>
        )}
      </ListItem>
    );
  });
};

const SideMenu = ({ showSideMenu, toggleSideMenu, enableSideMenu, menuItems }) => {
  const items = getMappedMenuItems(menuItems);
  const { AdServer } = useSelector(configSelectors.getAppData);

  return (
    enableSideMenu && (
      <Drawer
        PaperProps={{
          sx: {
            backgroundColor: 'navy.main',
          },
        }}
        open={showSideMenu}
        onClose={() => toggleSideMenu(false)}
        variant="permanent"
      >
        <Toolbar sx={{ pl: 2 }} className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
          <Link href={AdServer.LandingUrl} target="_self">
            <Icon
              name="logo"
              sx={{
                width: 32,
                height: 32,
                color: 'white.main',
              }}
            />
            {showSideMenu && (
              <Icon
                name="adSharesText"
                sx={{
                  ml: 1,
                  mb: 1,
                  width: 79,
                  height: 9,
                  color: 'white.main',
                }}
              />
            )}
          </Link>
        </Toolbar>
        <Divider sx={{ borderColor: 'deep.main' }} />
        <List disablePadding>{items}</List>
      </Drawer>
    )
  );
};

export default SideMenu;
