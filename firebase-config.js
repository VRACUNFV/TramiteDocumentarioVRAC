// firebase-config.js
import { initializeApp } from "firebase/app";
import { getMessaging, onMessage, getToken } from "firebase/messaging";

// Copia la configuración de "Project Settings" → "General" → "Tus apps"
const firebaseConfig = {
  apiKey: "AIzaSyBk45KqAWvh52FzOEwKBuEsW8-dAD5V9os",
  authDomain: "vrac-unfv.firebaseapp.com",
  projectId: "vrac-unfv",
  storageBucket: "vrac-unfv.firebasestorage.app",
  messagingSenderId: "612784182198",
  appId: "1:612784182198:web:e154ed27de26f5760ea717"
};

// Inicializa la app de Firebase
const app = initializeApp(firebaseConfig);

// Obtiene el servicio de mensajería (para notificaciones push)
const messaging = getMessaging(app);

export { messaging, onMessage, getToken };
