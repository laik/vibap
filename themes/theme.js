import {createTheme, responsiveFontSizes} from '@mui/material';

const drawerIndex = {drawer: 1050};
export const themeOptions = {
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
  direction: 'ltr',
  components: {
    MuiCssBaseline: {
      styleOverrides: `
      html:root {
        --vale-nav-height: 50px;
        --vale-nav-shadow: 0 2px 3px rgba(61, 61, 61, .15);
        --vale-line-divider-default: rgba(31,35,41,0.12);
        --vale-subSidebar-width: 400px;
        --vale-main-background-color: #f7f8fa;
        --vale-main-padding: 10px;
      }
      `,
    },
  },
  palette: {
    mode: 'light',
    // background: {
    //   default: '#f5f5f5',
    // },
    primary: {
      main: '#295dfa',
    },
    common: {
      black: '#434343',
      white: '#fff',
    },
    info: {
      lighter: '#D0F2FF',
      light: '#74CAFF',
      main: '#1890FF',
      dark: '#0C53B7',
      darker: '#04297A',
      contrastText: '#fff',
    },
    success: {
      lighter: '#E9FCD4',
      light: '#AAF27F',
      main: '#54D62C',
      dark: '#229A16',
      darker: '#08660D',
      contrastText: '#212B36',
    },
    warning: {
      lighter: '#FFF7CD',
      light: '#FFE16A',
      main: '#FFC107',
      dark: '#B78103',
      darker: '#7A4F01',
      contrastText: '#212B36',
    },
    error: {
      lighter: '#FFE7D9',
      light: '#FFA48D',
      main: '#FF4842',
      dark: '#B72136',
      darker: '#7A0C2E',
      contrastText: '#fff',
    },
    grey: {
      0: '#FFFFFF',
      50: '#fafafa',
      100: '#F9FAFB',
      200: '#F4F6F8',
      300: '#DFE3E8',
      400: '#C4CDD5',
      500: '#919EAB',
      600: '#637381',
      700: '#454F5B',
      800: '#212B36',
      900: '#161C24',
      5008: 'rgba(145, 158, 171, 0.08)',
      50012: 'rgba(145, 158, 171, 0.12)',
      50016: 'rgba(145, 158, 171, 0.16)',
      50024: 'rgba(145, 158, 171, 0.24)',
      50032: 'rgba(145, 158, 171, 0.32)',
      50048: 'rgba(145, 158, 171, 0.48)',
      50056: 'rgba(145, 158, 171, 0.56)',
      50080: 'rgba(145, 158, 171, 0.8)',
      A100: '#f5f5f5',
      A200: '#eeeeee',
      A400: '#bdbdbd',
      A700: '#616161',
    },
    gradients: {
      primary: 'linear-gradient(to bottom, #5BE584, #00AB55)',
      info: 'linear-gradient(to bottom, #74CAFF, #1890FF)',
      success: 'linear-gradient(to bottom, #AAF27F, #54D62C)',
      warning: 'linear-gradient(to bottom, #FFE16A, #FFC107)',
      error: 'linear-gradient(to bottom, #FFA48D, #FF4842)',
    },
    divider: 'rgba(145, 158, 171, 0.24)',
    action: {
      active: '#637381',
      hover: 'rgba(145, 158, 171, 0.08)',
      selected: 'rgba(145, 158, 171, 0.16)',
      disabled: 'rgba(145, 158, 171, 0.8)',
      disabledBackground: 'rgba(145, 158, 171, 0.24)',
      focus: 'rgba(145, 158, 171, 0.24)',
      hoverOpacity: 0.08,
      disabledOpacity: 0.48,
      selectedOpacity: 0.08,
      focusOpacity: 0.12,
      activatedOpacity: 0.12,
    },
    contrastThreshold: 3,
    tonalOffset: 0.2,
  },
  typography: {
    fontFamily: 'Public Sans, sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700,
    h1: {
      fontWeight: 700,
      lineHeight: 1.25,
      fontSize: '2.5rem',
      '@media (min-width:600px)': {
        fontSize: '3.25rem',
      },
      '@media (min-width:900px)': {
        fontSize: '3.625rem',
      },
      '@media (min-width:1200px)': {
        fontSize: '4rem',
      },
      fontFamily: 'Public Sans, sans-serif',
    },
    h2: {
      fontWeight: 700,
      lineHeight: 1.3333333333333333,
      fontSize: '2rem',
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
      '@media (min-width:900px)': {
        fontSize: '2.75rem',
      },
      '@media (min-width:1200px)': {
        fontSize: '3rem',
      },
      fontFamily: 'Public Sans, sans-serif',
    },
    h3: {
      fontWeight: 700,
      lineHeight: 1.5,
      fontSize: '1.5rem',
      '@media (min-width:600px)': {
        fontSize: '1.625rem',
      },
      '@media (min-width:900px)': {
        fontSize: '1.875rem',
      },
      '@media (min-width:1200px)': {
        fontSize: '2rem',
      },
      fontFamily: 'Public Sans, sans-serif',
    },
    h4: {
      fontWeight: 700,
      lineHeight: 1.5,
      fontSize: '1.25rem',
      '@media (min-width:600px)': {
        fontSize: '1.25rem',
      },
      '@media (min-width:900px)': {
        fontSize: '1.5rem',
      },
      '@media (min-width:1200px)': {
        fontSize: '1.5rem',
      },
      fontFamily: 'Public Sans, sans-serif',
    },
    h5: {
      fontWeight: 700,
      lineHeight: 1.5,
      fontSize: '1.125rem',
      '@media (min-width:600px)': {
        fontSize: '1.1875rem',
      },
      '@media (min-width:900px)': {
        fontSize: '1.25rem',
      },
      '@media (min-width:1200px)': {
        fontSize: '1.25rem',
      },
      fontFamily: 'Public Sans, sans-serif',
    },
    h6: {
      fontWeight: 700,
      lineHeight: 1.5555555555555556,
      fontSize: '1.0625rem',
      '@media (min-width:600px)': {
        fontSize: '1.125rem',
      },
      '@media (min-width:900px)': {
        fontSize: '1.125rem',
      },
      '@media (min-width:1200px)': {
        fontSize: '1.125rem',
      },
      fontFamily: 'Public Sans, sans-serif',
    },
    subtitle1: {
      fontWeight: 600,
      lineHeight: 1.5,
      fontSize: '1rem',
      fontFamily: 'Public Sans, sans-serif',
    },
    subtitle2: {
      fontWeight: 600,
      lineHeight: 1.5714285714285714,
      fontSize: '0.875rem',
      fontFamily: 'Public Sans, sans-serif',
    },
    body1: {
      lineHeight: 1.5,
      fontSize: '1rem',
      fontFamily: 'Public Sans, sans-serif',
      fontWeight: 400,
    },
    body2: {
      lineHeight: 1.5714285714285714,
      fontSize: '0.875rem',
      fontFamily: 'Public Sans, sans-serif',
      fontWeight: 400,
    },
    caption: {
      lineHeight: 1.5,
      fontSize: '0.75rem',
      fontFamily: 'Public Sans, sans-serif',
      fontWeight: 400,
    },
    overline: {
      fontWeight: 700,
      lineHeight: 1.5,
      fontSize: '0.75rem',
      letterSpacing: 1.1,
      textTransform: 'uppercase',
      fontFamily: 'Public Sans, sans-serif',
    },
    button: {
      fontWeight: 700,
      lineHeight: 1.7142857142857142,
      fontSize: '0.875rem',
      textTransform: 'capitalize',
      fontFamily: 'Public Sans, sans-serif',
    },
    htmlFontSize: 16,
    fontSize: 14,
    fontWeightLight: 300,
  },
  customShadows: {
    z1: '0 1px 2px 0 rgba(145, 158, 171, 0.24)',
    z8: '0 8px 16px 0 rgba(145, 158, 171, 0.24)',
    z12: '0 0 2px 0 rgba(145, 158, 171, 0.24), 0 12px 24px 0 rgba(145, 158, 171, 0.24)',
    z16: '0 0 2px 0 rgba(145, 158, 171, 0.24), 0 16px 32px -4px rgba(145, 158, 171, 0.24)',
    z20: '0 0 2px 0 rgba(145, 158, 171, 0.24), 0 20px 40px -4px rgba(145, 158, 171, 0.24)',
    z24: '0 0 4px 0 rgba(145, 158, 171, 0.24), 0 24px 48px 0 rgba(145, 158, 171, 0.24)',
    primary: '0 8px 16px 0 rgba(0, 171, 85, 0.24)',
    secondary: '0 8px 16px 0 rgba(51, 102, 255, 0.24)',
    info: '0 8px 16px 0 rgba(24, 144, 255, 0.24)',
    success: '0 8px 16px 0 rgba(84, 214, 44, 0.24)',
    warning: '0 8px 16px 0 rgba(255, 193, 7, 0.24)',
    error: '0 8px 16px 0 rgba(255, 72, 66, 0.24)',
  },
  mixins: {
    toolbar: {
      minHeight: 56,
      '@media (min-width:0px) and (orientation: landscape)': {
        minHeight: 48,
      },
      '@media (min-width:600px)': {
        minHeight: 64,
      },
    },
  },
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
  // 自定义
  shape: {
    borderRadius: 3,
  },
  zIndex: drawerIndex,
};

let theme = createTheme(themeOptions);
theme = responsiveFontSizes(theme);

/**
 * https://next.material-ui.com/zh/customization/z-index/#main-content
 *
 * app bar（应用栏）：1100
 * drawer（抽屉）：1100
 *
 * => drawer（抽屉）：1050
 */

export default theme;
