// components/FirebaseMessagingInitializer.js
import { useEffect } from 'react';
import { app } from '../firebase-config';

export default function FirebaseMessagingInitializer() {
  useEffect(() => {
    // Solo en el cliente
    if (typeof window !== 'undefined') {
      // Registrar el service worker con ruta absoluta
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/firebase-messaging-sw.js')
          .then((reg) => console.log('Service Worker registrado:', reg))
          .catch((err) => console.error('Error al registrar SW:', err));
      }

      // Importación dinámica de firebase/messaging
      import('firebase/messaging').then((messagingModule) => {
        const { getMessaging, getToken, onMessage } = messagingModule;
        const messaging = getMessaging(app);

        // Solicitar permiso
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            // Usa tu VAPID KEY
            getToken(messaging, { vapidKey: 'BA4qpeyZDBlNQh1LCm034tSw1Tm5aV31KoFqDy0up-05K6nMXDxNyI8Ug1BtaESUL4okM7OjGZoLhWcaaooza6A' })
              .then((currentToken) => {
                if (currentToken) {
                  console.log('Token FCM:', currentToken);
                  // Envía este token a tu backend si lo requieres
                } else {
                  console.log('No se pudo obtener token de FCM.');
                }
              })
              .catch((err) => console.error('Error al obtener token FCM:', err));
          }
        });

        // Manejar mensajes en primer plano
        onMessage(messaging, (payload) => {
          console.log('Mensaje en primer plano:', payload);
          // Muestra un alert, Snackbar, etc.
        });
      });
    }
  }, []);

  return null; // Este componente no renderiza nada
}
