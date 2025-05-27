//web/src/firebaseConfig.js

import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPopup,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  // Added Firebase Auth functions and types
  updateProfile,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  linkWithCredential
  // AuthCredential will be imported as a type where needed, or you can define it
  // For example: import type { AuthCredential } from "firebase/auth";
  // Or if it's used as a general type, it's often implicitly handled by TypeScript
} from "firebase/auth";
// For AuthCredential type, if you need to explicitly export it:
// import type { AuthCredential as FirebaseUserCredential } from "firebase/auth"; // Renaming if needed

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsyqOD8dZ3Z-_p4IKzual4cyakd89pR64", // Replace with your actual API key if this is a placeholder
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

// This component seems to be for initializing Analytics.
// It's generally fine, but ensure it's used appropriately in your app.
const FirebaseConfig = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    // Initialize Firebase Analytics only on the client side
    if (typeof window !== "undefined") {
      import("firebase/analytics").then(({ getAnalytics }) => {
        // Check if Firebase app is initialized
        if (app) {
          const analyticsInstance = getAnalytics(app);
          setAnalytics(analyticsInstance);
          console.log("Firebase Analytics initialized.");
        } else {
          console.error("Firebase app not initialized before Analytics.");
        }
      }).catch(error => {
        console.error("Error loading Firebase Analytics:", error);
      });
    }
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div>
      {/* Render or use analytics if available */}
      {/* This <p> tag is likely for debugging, consider removing for production */}
      {/* {analytics && <p>Analytics is initialized!</p>} */}
    </div>
  );
};

// Export necessary Firebase modules
export {
  FirebaseConfig, // The React component
  app, // Exporting the initialized app can be useful
  auth, // Exporting the auth instance
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPopup,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  // Exporting the newly added functions
  updateProfile,
  fetchSignInMethodsForEmail,
  linkWithCredential
  // For AuthCredential type, it's typically imported directly in the files that need it:
  // import type { AuthCredential } from 'firebase/auth';
  // If you wanted to re-export it from this file, you could do:
  // export type { FirebaseUserCredential as AuthCredential };
};

// It's good practice to also export the type if you intend for this file to be the single source
// export type { AuthCredential } from "firebase/auth"; // This line would make the type directly exportable
// However, for this to work, your file needs to be treated as a module that can export types.
// If it's a .js file, you might rely on JSDoc or direct imports in consuming .ts/.tsx files.
