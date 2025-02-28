importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js");

// Inicializa Firebase en el SW con los mismos valores
firebase.initializeApp({
  apiKey: "AIzaSyBk45KqAWvh52FzOEwKBuEsW8-dAD5V9os",
  authDomain: "vrac-unfv.firebaseapp.com",
  projectId: "vrac-unfv",
  storageBucket: "vrac-unfv.firebasestorage.app",
  messagingSenderId: "612784182198",
  appId: "1:612784182198:web:e154ed27de26f5760ea717"
});

const messaging = firebase.messaging();

// Manejo de mensajes en segundo plano:
messaging.onBackgroundMessage((payload) => {
  console.log("Mensaje en segundo plano:", payload);
  // self.registration.showNotification("Título", { body: "Texto" });
});
