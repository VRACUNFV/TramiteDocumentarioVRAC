import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      // Color guinda (puedes ajustar el tono a tu preferencia)
      main: '#800000',
    },
    secondary: {
      main: '#ffffff', // Usamos blanco como acento
    },
    background: {
      // Un color de fondo suave que contraste bien con el guinda
      default: '#f5f5f5',
    },
  },
  typography: {
    // Usamos una tipografía moderna; asegúrate de importarla en tu _document.js o index.html
    fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
  },
});

export default theme;
