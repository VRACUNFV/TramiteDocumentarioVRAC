import { createTheme } from '@mui/material/styles';

// Puedes personalizar estos valores según la identidad visual del VRAC
const theme = createTheme({
  palette: {
    primary: {
      main: '#ff6600', // Color principal, ajusta según el logo o la identidad institucional
    },
    secondary: {
      main: '#003366', // Color secundario
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export default theme;
