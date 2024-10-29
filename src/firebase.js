// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';




// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDSy2bioKVlxFf4HMOYdBR72Fvr8O7Xi00",
    authDomain: "txokoandaluz-70838.firebaseapp.com",
    databaseURL: "https://txokoandaluz-70838-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "txokoandaluz-70838",
    storageBucket: "txokoandaluz-70838.appspot.com",
    messagingSenderId: "14133568676",
    appId: "1:14133568676:web:42c44e142ec7728dfd3231",
    measurementId: "G-2WFBZWYBC8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

/*const analytics = getAnalytics(app);*/ 
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getDatabase(app);


export const firestore = getFirestore(app);
export { auth, db, googleProvider };

