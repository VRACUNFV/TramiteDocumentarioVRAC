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

// Importa funciones de Firebase Messaging del SDK modular
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
// Importa la instancia de Firebase inicializada (sin llamar a getMessaging aquí)
import { app } from '../firebase-config';

const clientSideEmotionCache = createEmotionCache();

export default function MyApp(props) {
  const { Component, pageProps: { session, ...pageProps }, emotionCache = clientSideEmotionCache } = props;

  useEffect(() => {
    // Solo en el cliente
    if (typeof window !== 'undefined') {
      // Registrar el Service Worker (asegúrate de tener public/firebase-messaging-sw.js)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/firebase-messaging-sw.js')
          .then(registration => {
            console.log('Service Worker registrado:', registration);
          })
          .catch(err => console.error('Error al registrar SW:', err));
      }
      
      // Inicializar Firebase Messaging
      const messaging = getMessaging(app);
      
      // Solicitar permiso de notificaciones
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          // Obtener el token FCM usando la VAPID KEY (reemplaza "TU_VAPID_KEY" por el valor real)
          getToken(messaging, { vapidKey: 'TU_VAPID_KEY' })
            .then(currentToken => {
              if (currentToken) {
                console.log('Token FCM:', currentToken);
                // Aquí podrías enviar este token a tu backend si lo necesitas
              } else {
                console.log('No se pudo obtener token de FCM.');
              }
            })
            .catch(err => console.error('Error al obtener token FCM:', err));
        }
      });
      
      // Manejar mensajes en primer plano
      onMessage(messaging, payload => {
        console.log('Mensaje en primer plano:', payload);
        // Aquí puedes, por ejemplo, mostrar un Snackbar o notificación en la UI
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
