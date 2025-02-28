// firebase-config.js
import { initializeApp } from "firebase/app";
import { getMessaging, onMessage, getToken } from "firebase/messaging";

// Copia la configuración de "Project Settings" → "General" → "Tus apps"
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcd1234efgh5678"
};

// Inicializa la app de Firebase
const app = initializeApp(firebaseConfig);

// Obtiene el servicio de mensajería (para notificaciones push)
const messaging = getMessaging(app);

export { messaging, onMessage, getToken };
