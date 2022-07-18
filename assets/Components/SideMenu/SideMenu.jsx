import React from 'react';
import { useNavigate } from 'react-router-dom';
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

const drawerWidth = 240;

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
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
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
}));

const Accordion = styled(MuiAccordion, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme }) => ({
  '&': {
    borderRadius: 0,
    boxShadow: 'none',
  },
  '&:last-of-type': {
    borderRadius: 0,
  },
  '& .MuiAccordion-region:before': {
    content: '""',
    display: 'block',
    height: ' calc(100% - 64px)',
    width: '2px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    position: 'absolute',
    left: '8px',
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

const AccordionSummary = styled(MuiAccordionSummary)(({}) => ({
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

const getMappedMenuItems = (items, nav) => {
  return items.map((item) => {
    if (item.children) {
      return (
        <Accordion sx={{ border: 0 }} key={item.name}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <ListItemIcon>{<item.icon />}</ListItemIcon>
            <Typography>{item.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>{getMappedMenuItems(item.children, nav)}</AccordionDetails>
        </Accordion>
      );
    }
    return (
      <ListItem key={item.name} disablePadding onClick={() => nav(item.path)}>
        <ListItemButton>
          <ListItemIcon>{<item.icon />}</ListItemIcon>
          <ListItemText primary={item.name} />
        </ListItemButton>
      </ListItem>
    );
  });
};

const SideMenu = ({ showSideMenu, toggleSideMenu, enableSideMenu, menuItems }) => {
  console.log(showSideMenu);
  const navigate = useNavigate();
  const items = getMappedMenuItems(menuItems, navigate);

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
