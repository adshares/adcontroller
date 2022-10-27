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
    MuiCard: {
      variants: [
        {
          props: { width: 'full' },
          style: { width: '100%' },
        },
        {
          props: { width: 'mainContainer' },
          style: { width: '100%', maxWidth: '1280px' },
        },
      ],
    },
  },
});

export default theme;
