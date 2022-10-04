import React, { useState } from 'react';
import MuiTextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { InputAdornment, TextField } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const CollapsibleStyledTextarea = styled(MuiTextField, {
  shouldForwardProp: (propName) => {
    return propName !== 'collapsible' && propName !== 'focused';
  },
})(
  ({ theme, collapsible = false, rows, focused }) =>
    collapsible && {
      '& textarea': {
        height: '23px !important',
        overflow: 'hidden',
        transition: theme.transitions.create('height', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        '&::-webkit-scrollbar': {
          backgroundColor: `${theme.palette.primary.light}50`,
          width: '8px',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: `${theme.palette.primary.main}50`,
          borderRadius: '10px',
        },
      },
      '& textarea:focus': {
        height: `${rows * 23}px !important`,
        overflow: 'auto',
        transition: theme.transitions.create('height', {
          duration: theme.transitions.duration.enteringScreen,
          easing: theme.transitions.easing.sharp,
        }),
      },
      '& .MuiInputBase-root': {
        alignItems: 'flex-start',
      },
      '& .MuiSvgIcon-root ': {
        transform: focused ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: theme.transitions.create('transform', {
          duration: theme.transitions.duration.enteringScreen,
          easing: theme.transitions.easing.sharp,
        }),
      },
    },
);

const CollapsibleTextarea = (props) => {
  const [focused, setFocused] = useState(false);
  return props.collapsible ? (
    <CollapsibleStyledTextarea
      focused={focused}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end" sx={{ mt: 1.5 }}>
            <KeyboardArrowDownIcon color={focused ? 'primary' : 'grey'} />
          </InputAdornment>
        ),
      }}
      {...props}
    />
  ) : (
    <TextField {...props} />
  );
};

export default CollapsibleTextarea;
