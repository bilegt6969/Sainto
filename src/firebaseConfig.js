import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, RecaptchaVerifier, signInWithPopup, signInWithPhoneNumber, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsyqOD8dZ3Z-_p4IKzual4cyakd89pR64",
  authDomain: "sonder-b673f.firebaseapp.com",
  projectId: "sonder-b673f",
  storageBucket: "sonder-b673f.firebasestorage.app",
  messagingSenderId: "682189102539",
  appId: "1:682189102539:web:eb7765461951a2ae486a4e",
  measurementId: "G-5Q4KMTGHC8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth outside of FirebaseConfig component
const auth = getAuth(app);

const FirebaseConfig = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    // Initialize Firebase Analytics only on the client side
    if (typeof window !== "undefined") {
      import("firebase/analytics").then(({ getAnalytics }) => {
        const analyticsInstance = getAnalytics(app);
        setAnalytics(analyticsInstance);
      });
    }
  }, []);

  return (
    <div>
      {/* Render or use analytics if available */}
      {analytics && <p>Analytics is initialized!</p>}
    </div>
  );
};

// Export necessary Firebase modules
export {
  FirebaseConfig,
  auth, // Now exported correctly
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPopup,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
};
