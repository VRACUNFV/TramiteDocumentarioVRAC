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

// Importa solo la instancia "app" desde firebase-config.js
import { app } from '../firebase-config';

const clientSideEmotionCache = createEmotionCache();

export default function MyApp(props) {
  const { Component, pageProps: { session, ...pageProps }, emotionCache = clientSideEmotionCache } = props;

  useEffect(() => {
    // Asegurarse de que el siguiente código se ejecute solo en el cliente
    if (typeof window !== 'undefined') {
      // Registrar el service worker para Firebase Cloud Messaging
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/firebase-messaging-sw.js')
          .then((registration) => {
            console.log('Service Worker registrado:', registration);
          })
          .catch((err) => console.error('Error al registrar SW:', err));
      }

      // Importación dinámica de Firebase Messaging (para que no se ejecute en el servidor)
      import('firebase/messaging').then((messagingModule) => {
        const { getMessaging, getToken, onMessage } = messagingModule;
        const messaging = getMessaging(app);

        // Solicitar permiso de notificaciones
        if ("Notification" in window) {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              // Obtén el token FCM usando la VAPID KEY proporcionada
              getToken(messaging, { vapidKey: 'BA4qpeyZDBlNQh1LCm034tSw1Tm5aV31KoFqDy0up-05K6nMXDxNyI8Ug1BtaESUL4okM7OjGZoLhWcaaooza6A' })
                .then((currentToken) => {
                  if (currentToken) {
                    console.log('Token FCM:', currentToken);
                    // Aquí podrías enviar el token a tu backend para notificaciones push
                  } else {
                    console.log('No se pudo obtener token de FCM.');
                  }
                })
                .catch((err) => console.error('Error al obtener token FCM:', err));
            }
          });
        }

        // Manejar mensajes en primer plano
        onMessage(messaging, (payload) => {
          console.log('Mensaje en primer plano:', payload);
          // Aquí puedes mostrar un Snackbar o alert para notificar al usuario
        });
      });
    }
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <SessionProvider session={session}>
        <ThemeProvider theme={theme}>
          <Head>
            <meta name="viewport" content="initial-scale=1, width=device-width" />
          </Head>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </SessionProvider>
    </CacheProvider>
  );
}
