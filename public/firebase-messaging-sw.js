importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js");

// Inicializa Firebase en el SW con los mismos valores
firebase.initializeApp({
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcd1234efgh5678"
});

const messaging = firebase.messaging();

// Manejo de mensajes en segundo plano:
messaging.onBackgroundMessage((payload) => {
  console.log("Mensaje en segundo plano:", payload);
  // self.registration.showNotification("Título", { body: "Texto" });
});
