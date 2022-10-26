import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const drawerWidth = 256;

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
  // flexShrink: 0,
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

const Accordion = styled(MuiAccordion, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme }) => ({
  '&': {
    boxShadow: 'none',
  },
  '& .MuiAccordion-region:before': {
    content: '""',
    display: 'block',
    height: 'calc(100% - 48px)',
    width: '2px',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    position: 'absolute',
    left: '14px',
    borderRadius: '2px',
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

const AccordionSummary = styled(MuiAccordionSummary)(() => ({
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
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
    if (item.children) {
      return (
        <ListItem key={item.name} disablePadding>
          <Accordion expanded={expanded.includes(item.name)} onChange={handleChange(item.name)} disableGutters square>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <ListItemIcon>{<item.icon sx={item.rotateIcon && { transform: `rotate(${item.rotateIcon})` }} />}</ListItemIcon>
              <Typography>{item.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>{getMappedMenuItems(item.children, navigate)}</List>
            </AccordionDetails>
          </Accordion>
        </ListItem>
      );
    }
    return (
      <ListItem key={item.name} disablePadding onClick={() => navigate(item.path)}>
        <ListItemButton selected={item.path === location.pathname}>
          <ListItemIcon>{<item.icon sx={item.rotateIcon && { transform: `rotate(${item.rotateIcon})` }} />}</ListItemIcon>
          <ListItemText primary={item.name} primaryTypographyProps={{ sx: { fontWeight: item.path === location.pathname ? 600 : 400 } }} />
        </ListItemButton>
      </ListItem>
    );
  });
};

const SideMenu = ({ showSideMenu, toggleSideMenu, enableSideMenu, menuItems }) => {
  const items = getMappedMenuItems(menuItems);

  return (
    enableSideMenu && (
      <Drawer open={showSideMenu} onClose={() => toggleSideMenu(false)} variant="permanent">
        <Toolbar />
        <Box>
          <List>{items}</List>
          <Divider />
        </Box>
      </Drawer>
    )
  );
};

export default SideMenu;
