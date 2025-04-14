import { createTheme } from '@mui/material/styles';

// Цвета Wildberries
const wildberriesColors = {
  primary: '#cb11ab', // Основной пурпурный цвет Wildberries
  secondary: '#8126b3', // Более темный пурпурный
  dark: '#4b0079', // Очень темный пурпурный
  light: '#faeaf5', // Светлый пурпурный фон
  darkGrey: '#333333', // Цвет текста
  midGrey: '#757575', // Цвет вторичного текста
  lightGrey: '#f6f6f6', // Светло-серый фон
  danger: '#ff2c4c', // Цвет ошибки/опасности
  success: '#2aad27', // Цвет успеха
};

// Создаем тему
const theme = createTheme({
  palette: {
    primary: {
      main: wildberriesColors.primary,
      dark: wildberriesColors.secondary,
      contrastText: '#fff',
    },
    secondary: {
      main: wildberriesColors.secondary,
      dark: wildberriesColors.dark,
      light: wildberriesColors.light,
    },
    error: {
      main: wildberriesColors.danger,
    },
    success: {
      main: wildberriesColors.success,
    },
    text: {
      primary: wildberriesColors.darkGrey,
      secondary: wildberriesColors.midGrey,
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 700,
      fontSize: '1.75rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    subtitle1: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 22px',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: wildberriesColors.primary,
          '&:hover': {
            backgroundColor: wildberriesColors.secondary,
          },
        },
        outlinedPrimary: {
          borderColor: wildberriesColors.primary,
          color: wildberriesColors.primary,
          '&:hover': {
            backgroundColor: 'rgba(203, 17, 171, 0.04)',
            borderColor: wildberriesColors.secondary,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: wildberriesColors.primary,
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: wildberriesColors.primary,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        colorPrimary: {
          backgroundColor: wildberriesColors.primary,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: wildberriesColors.primary,
          height: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.9rem',
          '&.Mui-selected': {
            color: wildberriesColors.primary,
            fontWeight: 600,
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: wildberriesColors.light,
        },
        barColorPrimary: {
          backgroundColor: wildberriesColors.primary,
        },
      },
    },
  },
});

export default theme;