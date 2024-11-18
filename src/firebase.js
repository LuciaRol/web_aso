// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore'; // Agregar estas importaciones

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCYWzz8NI4WpdGCDBMQvEMC3CJBPVIcd5s",
    authDomain: "dragon-de-madera.firebaseapp.com",
    projectId: "dragon-de-madera",
    storageBucket: "dragon-de-madera.firebasestorage.app",
    messagingSenderId: "691925864934",
    appId: "1:691925864934:web:f6407782deb071e0988627",
    measurementId: "G-19Z5EXFQ47"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

/*const analytics = getAnalytics(app);*/ 
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getDatabase(app);

// Inicializar Firestore
export const firestore = getFirestore(app);

// Exportar las funciones de Firestore que necesitas
export { auth, db, googleProvider, collection, addDoc, getDocs };
