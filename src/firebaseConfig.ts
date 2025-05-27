// web/src/firebaseConfig.ts

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPopup,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  type Auth,
  type AuthError,
  type UserCredential,
  type AuthProvider,
  type AuthCredential,
  type OAuthCredential,
  type User,
  type ConfirmationResult,
  type ApplicationVerifier
} from "firebase/auth";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

// Your Firebase configuration
const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyBsyqOD8dZ3Z-_p4IKzual4cyakd89pR64",
  authDomain: "sonder-b673f.firebaseapp.com",
  projectId: "sonder-b673f",
  storageBucket: "sonder-b673f.appspot.com",
  messagingSenderId: "682189102539",
  appId: "1:682189102539:web:eb7765461951a2ae486a4e",
  measurementId: "G-5Q4KMTGHC8"
};

// Initialize Firebase App (handle server-side rendering/multiple initializations)
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
const auth: Auth = getAuth(app);

// Initialize Firebase Analytics (conditionally, client-side only)
let analytics: Analytics | undefined;
if (typeof window !== "undefined") {
  isSupported().then((supported: boolean) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("Firebase Analytics initialized.");
    } else {
      console.log("Firebase Analytics not supported in this environment.");
    }
  }).catch((error: Error) => {
    console.error("Error checking analytics support:", error);
  });
}

// Export Firebase instances
export {
  app,
  auth,
  analytics,
  firebaseConfig
};

// Export Firebase provider classes
export {
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  RecaptchaVerifier
};

// Export Firebase auth methods
export {
  signInWithPopup,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  fetchSignInMethodsForEmail,
  linkWithCredential
};

// Export Firebase types for use in other components
export type {
  AuthError,
  UserCredential,
  AuthProvider,
  AuthCredential,
  OAuthCredential,
  User,
  ConfirmationResult,
  ApplicationVerifier,
  Auth,
  FirebaseApp,
  Analytics
};

// Export the FirebaseConfig interface
export type { FirebaseConfig };