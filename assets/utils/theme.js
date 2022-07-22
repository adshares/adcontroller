import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  // palette: {
  //   primary: {
  //     main: '#45FFa6',
  //   },
  // },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: 'lightgrey',
        },
      },
    },
  },
});

export default theme;
