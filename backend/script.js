import { auth, provider, db, createUserWithEmailAndPassword, signInWithPopup, setDoc, doc } from './firebase.js';

// Email & Password Signup
document.querySelector(".signup-btn").addEventListener("click", async (e) => {
    e.preventDefault();

    const username = document.querySelector("#username").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: email,
            createdAt: new Date()
        });

        alert("Signup Successful!");
        window.location.href = "landingpage.html"; 
    } catch (error) {
        alert(error.message);
    }
});

// Google Sign-In
document.querySelector(".google-signin").addEventListener("click", async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        alert("Google Sign-In Successful!");
        window.location.href = "frontend\Html\landingpage.html";
    } catch (error) {
        alert(error.message);
    }
});
