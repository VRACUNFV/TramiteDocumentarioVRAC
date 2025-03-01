// components/FirebaseMessagingInitializer.js
import { useEffect } from 'react';
import { app } from '../firebase-config';

export default function FirebaseMessagingInitializer() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Registrar el Service Worker para Firebase Cloud Messaging
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/firebase-messaging-sw.js')
          .then((registration) => {
            console.log('Service Worker registrado:', registration);
          })
          .catch((err) => console.error('Error al registrar SW:', err));
      }

      // Importación dinámica de Firebase Messaging (solo en cliente)
      import('firebase/messaging').then((messagingModule) => {
        const { getMessaging, getToken, onMessage } = messagingModule;
        const messaging = getMessaging(app);

        // Solicitar permiso de notificaciones
        if ("Notification" in window) {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              // Usa la VAPID KEY que proporcionaste
              getToken(messaging, { vapidKey: 'BA4qpeyZDBlNQh1LCm034tSw1Tm5aV31KoFqDy0up-05K6nMXDxNyI8Ug1BtaESUL4okM7OjGZoLhWcaaooza6A' })
                .then((currentToken) => {
                  if (currentToken) {
                    console.log('Token FCM:', currentToken);
                    // Aquí podrías enviar este token a tu backend para notificaciones push
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
          // Aquí puedes mostrar un Snackbar o notificación en la UI
        });
      });
    }
  }, []);

  return null;
}
