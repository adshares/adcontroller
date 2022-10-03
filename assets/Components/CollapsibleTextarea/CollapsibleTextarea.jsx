import MuiTextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

const CollapsibleTextarea = styled(MuiTextField, {
  shouldForwardProp: (propName) => {
    return propName !== 'collapsible';
  },
})(
  ({ theme, collapsible = false, rows }) =>
    collapsible && {
      '& textarea': {
        height: '23px !important',
        overflow: 'hidden',
        transition: theme.transitions.create('height', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      },
      '& textarea:focus': {
        height: `${rows * 23}px !important`,
        overflow: 'auto',
        transition: theme.transitions.create('height', {
          duration: theme.transitions.duration.enteringScreen,
          easing: theme.transitions.easing.sharp,
        }),
      },
    },
);

export default CollapsibleTextarea;
