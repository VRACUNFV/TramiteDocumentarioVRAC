import * as React from 'react';
import Head from 'next/head';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Sistema de Alertas VRAC</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline normaliza estilos por defecto */}
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
