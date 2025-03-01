// pages/_app.js
import * as React from 'react';
import { useEffect } from 'react';
import Head from 'next/head';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme/theme';

// NextAuth SessionProvider
import { SessionProvider } from 'next-auth/react';

// Emotion Cache para MUI
import createEmotionCache from '../theme/createEmotionCache';
import { CacheProvider } from '@emotion/react';

// Importa Next.js dynamic para cargar el componente de Firebase solo en el cliente
import dynamic from 'next/dynamic';

const clientSideEmotionCache = createEmotionCache();

// Importa FirebaseMessagingInitializer dinámicamente, sin SSR
const FirebaseMessagingInitializer = dynamic(
  () => import('../components/FirebaseMessagingInitializer'),
  { ssr: false }
);

export default function MyApp(props) {
  const { Component, pageProps: { session, ...pageProps }, emotionCache = clientSideEmotionCache } = props;

  return (
    <CacheProvider value={emotionCache}>
      <SessionProvider session={session}>
        <ThemeProvider theme={theme}>
          <Head>
            <meta name="viewport" content="initial-scale=1, width=device-width" />
          </Head>
          <CssBaseline />
          {/* Inicializa Firebase Messaging solo en el cliente */}
          <FirebaseMessagingInitializer />
          <Component {...pageProps} />
        </ThemeProvider>
      </SessionProvider>
    </CacheProvider>
  );
}
