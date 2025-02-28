// firebase-config.js
import { initializeApp } from "firebase/app";
import { getMessaging, onMessage, getToken } from "firebase/messaging";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBk45KqAWvh52FzOEwKBuEsW8-dAD5V9os",
  authDomain: "vrac-unfv.firebaseapp.com",
  projectId: "vrac-unfv",
  storageBucket: "vrac-unfv.firebasestorage.app",
  messagingSenderId: "612784182198",
  appId: "1:612784182198:web:e154ed27de26f5760ea717",
  measurementId: "G-LQ971WJQDQ"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const db = getFirestore(app);

export { app, messaging, db, onMessage, getToken };
