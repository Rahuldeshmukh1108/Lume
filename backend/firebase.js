import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAHL_VjbFjsnemCxfnR3rS4IrFMrhhKaF0",
    authDomain: "lume-6c502.firebaseapp.com",
    projectId: "lume-6c502",
    storageBucket: "lume-6c502.appspot.com",
    messagingSenderId: "1060714065022",
    appId: "1:1060714065022:web:adb6119e4bf3e0fd0a3c2f",
    measurementId: "G-ZQHSG20061"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, provider, db, createUserWithEmailAndPassword, signInWithPopup, setDoc, doc, getDoc, sendPasswordResetEmail, signOut };
