// pages/_app.js
import * as React from 'react';
import { useEffect } from 'react';
import Head from 'next/head';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme/theme';

// NextAuth SessionProvider
import { SessionProvider } from 'next-auth/react';

// Importamos EmotionCache para MUI
import createEmotionCache from '../theme/createEmotionCache';
import { CacheProvider } from '@emotion/react';

// IMPORTA la configuración de Firebase (asegúrate de crear "firebase-config.js")
import { messaging, getToken, onMessage } from '../firebase-config';

const clientSideEmotionCache = createEmotionCache();

export default function MyApp(props) {
  const {
    Component,
    pageProps: { session, ...pageProps },
    emotionCache = clientSideEmotionCache
  } = props;

  // Aquí añadimos el bloque para registrar SW y pedir permiso de notificaciones
  useEffect(() => {
    // 1. Registrar el service worker (si existe "public/firebase-messaging-sw.js")
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registrado:", registration);
        })
        .catch((err) => console.error("Error al registrar SW:", err));
    }

    // 2. Pedir permiso de notificaciones
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        // 3. Obtener token de FCM usando tu VAPID KEY
        getToken(messaging, { vapidKey: "BA4qpeyZDBlNQh1LCm034tSw1Tm5aV31KoFqDy0up-05K6nMXDxNyI8Ug1BtaESUL4okM7OjGZoLhWcaaooza6A" })
          .then((currentToken) => {
            if (currentToken) {
              console.log("Token FCM:", currentToken);
              // Envía este token a tu backend si quieres notificaciones server->client
            } else {
              console.log("No se pudo obtener token de FCM.");
            }
          })
          .catch((err) => console.error("Error al obtener token FCM:", err));
      }
    });

    // 4. Manejo de mensajes en primer plano
    onMessage(messaging, (payload) => {
      console.log("Mensaje en primer plano:", payload);
      // Aquí puedes mostrar un alert, un Snackbar, etc.
    });
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <SessionProvider session={session}>
        <ThemeProvider theme={theme}>
          <Head>
            <meta name="viewport" content="initial-scale=1, width=device-width" />
          </Head>
          {/* CssBaseline elimina estilos por defecto y normaliza */}
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </SessionProvider>
    </CacheProvider>
  );
}
