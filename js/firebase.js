import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyBmwuiR807guI-ZM9G-ETzShfQKPcaGdQQ",
  authDomain: "campus-digital-25e40.firebaseapp.com",
  projectId: "campus-digital-25e40",
  storageBucket: "campus-digital-25e40.firebasestorage.app",
  messagingSenderId: "822795705542",
  appId: "1:822795705542:web:70147364fecd2133998bc7",
  measurementId: "G-X59VXCDV1X"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const authReady = setPersistence(auth, browserLocalPersistence);
