import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      // Guinda
      main: '#800000',
    },
    secondary: {
      main: '#ffffff',
    },
    background: {
      // Fondo claro
      default: '#f5f5f5',
    },
  },
  typography: {
    // Fuente Montserrat
    fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
  },
});

export default theme;
