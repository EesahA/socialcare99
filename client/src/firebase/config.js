import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6sRbgvsscnpk8_ZPaF4scsN8H1jbf92w",
  authDomain: "socialcare-365.firebaseapp.com",
  projectId: "socialcare-365",
  storageBucket: "socialcare-365.firebasestorage.app",
  messagingSenderId: "747215680737",
  appId: "1:747215680737:web:b9fc2cc49866b2546c73a0",
  measurementId: "G-SDEZMKES1H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Analytics (optional - can be removed if not needed)
export const analytics = getAnalytics(app);

export default app; 