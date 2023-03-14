import { createTheme } from '@mui/material/styles';
import Montserrat from '../fonts/Montserrat/Montserrat-VariableFont_wght.ttf';

const grayBg = '#DFDFDF';
const navy = '#003D4D';
const blue = '#96DFEF';
const black = '#000000';
const deep = '#002F36';
const sky = '#BFF7FF';
const white = '#FFFFFF';
const sunset = '#FF414D';
const failBg = '#FFA0A6';
const sun = '#FFB400';
const warningBg = '#F8E7BF';
const disableBg = '#BFBFBF';
const disable = '#606060';
const freshGrass = '#19AD42';
const successBg = '#8DEBC8';

const theme = createTheme({
  direction: 'ltr',
  palette: {
    mode: 'light',
    primary: {
      main: navy,
      dark: deep,
      light: '#336370FF',
      contrastText: white,
    },
    secondary: {
      main: blue,
      light: sky,
      dark: '#699CA7FF',
      contrastText: white,
    },
    grayBg: {
      main: grayBg,
    },
    navy: {
      main: navy,
    },
    blue: {
      main: blue,
    },
    black: {
      main: black,
    },
    deep: {
      main: deep,
    },
    sky: {
      main: sky,
    },
    white: {
      main: white,
    },
    sunset: {
      light: failBg,
      main: sunset,
    },
    sun: {
      light: warningBg,
      main: sun,
    },
    freshGrass: {
      light: successBg,
      main: freshGrass,
    },
    common: {
      black: black,
      white: white,
    },
    error: {
      main: sunset,
      light: failBg,
    },
    warning: {
      main: sun,
    },
    info: {
      main: blue,
    },
    success: {
      main: freshGrass,
    },
    text: {
      primary: black,
      secondary: black,
      disabled: grayBg,
    },
    divider: disableBg,
    background: {
      paper: white,
      default: white,
      grayBg,
      disableBg,
    },
    action: {
      disabled: white,
      disabledBackground: '#809EA6',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: grayBg,
          '@font-face': {
            fontFamily: 'Montserrat',
            fontStyle: 'normal',
            fontDisplay: 'swap',
            fontWeight: 400,
            src: `local('Montserrat'), url(${Montserrat})`,
          },
          '&::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: '8px',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: `${navy}50`,
            borderRadius: '10px',
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          '&::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: '8px',
            height: '8px',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: `${navy}50`,
            width: '8px',
            borderRadius: '10px',
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          '&::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: '8px',
            height: '8px',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: `${navy}50`,
            width: '8px',
            borderRadius: '10px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minWidth: '150px',
          padding: '8px 20px',
          boxShadow: '4px 4px 5px rgba(0, 0, 0, 0.25)',
          '&.Mui-disabled': {
            cursor: 'not-allowed',
            pointerEvents: 'fill',
            boxShadow: '4px 4px 5px rgba(0, 0, 0, 0.25)',
          },
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
      variants: [
        {
          props: {
            variant: 'text',
          },
          style: {
            fontSize: '14px',
            fontVariationSettings: '"wght" 400',
            letterSpacing: '0.055em',
            textDecoration: 'underline',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'transparent',
            },
          },
        },
      ],
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&.Mui-disabled': {
            color: '#809EA6',
            cursor: 'not-allowed',
            pointerEvents: 'fill',
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        width: 'fix',
      },
      styleOverrides: {
        root: {
          padding: '9px 22px 22px 22px',
          boxShadow: '4px 4px 5px rgba(0, 0, 0, 0.25)',
        },
      },
      variants: [
        {
          props: {
            customvariant: 'outlined',
          },
          style: {
            boxShadow: 'none',
            border: `1px solid ${disableBg}`,
          },
        },
        {
          props: {
            width: 'fix',
          },
          style: {
            width: '100%',
            maxWidth: '1060px',
          },
        },
        {
          props: {
            width: 'full',
          },
          style: {
            width: '100%',
          },
        },
      ],
    },
    MuiCardHeader: {
      defaultProps: {
        titleTypographyProps: {
          component: 'h2',
          variant: 'h2',
        },
      },
      styleOverrides: {
        root: {
          '& .MuiCardHeader-subheader': {
            marginTop: '8px',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '9px 16px 16px 16px',
        },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          padding: '16px 16px',
          justifyContent: 'flex-end',
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          marginRight: '38px',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& fieldset': {
            borderColor: black,
          },
        },
      },
    },
    MuiFormControl: {
      variants: [
        {
          props: {
            customvariant: 'highLabel',
          },
          style: {
            '& .MuiOutlinedInput-notchedOutline': {
              top: 0,
            },
            '& .MuiOutlinedInput-notchedOutline > legend': {
              display: 'none',
            },
            '& .MuiInputLabel-root': {
              color: disableBg,
              '&.Mui-focused': {
                color: black,
                transform: 'translate(14px, -20px) scale(0.75)',
              },
              '&.MuiInputLabel-shrink': {
                color: black,
                transform: 'translate(14px, -20px) scale(0.75)',
              },
            },

            marginTop: '28px',
            marginBottom: '8px',
          },
        },
      ],
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          border: `1px solid ${blue}`,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          '& .MuiSlider-rail': {
            color: disableBg,
            height: '15px',
            borderRadius: '5px',
          },
          '& .MuiSlider-track ': {
            height: '15px',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          },
          '& .MuiSlider-thumb': {
            height: '25px',
            width: '5px',
            borderRadius: 0,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          '&.MuiTableCell-root': {
            borderColor: disableBg,
          },
          '&.MuiTableCell-head': {
            fontSize: '16px',
            lineHeight: 1.5,
          },
          '&.MuiTableCell-body': {
            fontSize: '12px',
            lineHeight: 1.5,
          },
        },
      },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: {
          '&:hover > .MuiTableSortLabel-icon': {
            opacity: 1,
          },
          '&.Mui-active > .MuiTableSortLabel-icon': {
            color: blue,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          alignItems: 'center',
          fontSize: '16px',
          fontVariationSettings: '"wght" 700',
          '&.MuiAlert-standardWarning': {
            backgroundColor: warningBg,
            color: sun,
          },
          '&.MuiAlert-standardError': {
            backgroundColor: failBg,
            color: sunset,
          },
          '&.MuiAlert-standardSuccess': {
            backgroundColor: successBg,
            color: freshGrass,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          overflow: 'initial',
          '& .MuiTabs-scroller': {
            overflow: 'initial !important',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: white,
            transition: 'none',
            height: '3px',
            bottom: '-2px',
          },
          '& .MuiTab-root': {
            padding: '7px 34px',
            border: `1px solid ${disableBg}`,
            borderBottom: 0,
            borderTopRightRadius: '15px',
            borderTopLeftRadius: '15px',
            overflow: 'none',

            '&.Mui-selected': {
              color: blue,
            },
          },
        },
      },
    },
    MuiTabPanel: {
      styleOverrides: {
        root: {
          border: `1px solid ${disableBg}`,
          borderRadius: '15px',
          borderTopLeftRadius: 0,
          padding: '38px',
          '& .MuiBox-root': {
            '&::-webkit-scrollbar': {
              backgroundColor: 'transparent',
              width: '8px',
              height: '8px',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: `${navy}50`,
              width: '8px',
              borderRadius: '10px',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          '& .MuiDialog-paper': {
            padding: '9px 22px 30px 22px',
          },
        },
      },
    },
  },
  typography: {
    htmlFontSize: 16,
    fontFamily: '"Montserrat", sans-serif',
    fontSize: 14,
    h2: {
      fontVariationSettings: '"wght" 700',
      fontSize: '32px',
      lineHeight: 1.2,
      letterSpacing: 0,
      fontWeight: 400,
    },
    h3: {
      fontVariationSettings: '"wght" 600',
      fontSize: '24px',
      lineHeight: 1.2,
      letterSpacing: 0,
      fontWeight: 400,
    },
    body1: {
      fontWeight: 400,
      fontSize: '16px',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: 1.5,
      letterSpacing: '0.01071em',
    },
    button: {
      textTransform: 'none',
      fontVariationSettings: '"wght" 600',
      fontSize: '20px',
      letterSpacing: '0.055em',
      lineHeight: '1.5',
    },
    alert: {
      fontVariationSettings: '"wght" 700',
      fontSize: '16px',
      letterSpacing: '0.055em',
      lineHeight: '1.1',
    },
    tableText1: {
      fontSize: '20px',
      fontVariationSettings: '"wght" 500',
      lineHeight: 1.5,
    },
    tableText2: {
      fontSize: '12px',
      lineHeight: 1.5,
    },

    b600: {
      fontVariationSettings: '"wght" 600',
    },
    b800: {
      fontVariationSettings: '"wght" 800',
    },
    b900: {
      fontVariationSettings: '"wght" 900',
    },
  },
  breakpoints: {
    keys: ['xs', 'sm', 'md', 'lg', 'xl'],
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
    unit: 'px',
  },
  shape: {
    borderRadius: 10,
  },
  mixins: {
    toolbar: {
      minHeight: 56,
      '@media (min-width:0px)': {
        '@media (orientation: landscape)': {
          minHeight: 48,
        },
      },
      '@media (min-width:600px)': {
        minHeight: 64,
      },
    },
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
    '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
    '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
    '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
    '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
    '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
    '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
    '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
    '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
    '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
    '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
    '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
    '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
    '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
    '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
    '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
    '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
  ],
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
  zIndex: {
    mobileStepper: 1000,
    fab: 1050,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
});

export default theme;
