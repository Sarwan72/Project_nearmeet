// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "gharbazaar-a31b0.firebaseapp.com",
    projectId: "gharbazaar-a31b0",
    storageBucket: "gharbazaar-a31b0.firebasestorage.app",
    messagingSenderId: "401403951941",
    appId: "1:401403951941:web:bb5fe6f7c57cf0292d9c2c",
    measurementId: "G-EWP6QBDTMT"
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
