import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey:"AIzaSyDAjRQlh_meYttEGxYoMu45WN1BSfo92Vk",
  authDomain: "se-project-hackethon.firebaseapp.com",
  projectId: "se-project-hackethon",
  storageBucket: "se-project-hackethon.firebasestorage.app",
  messagingSenderId: "969307621761",
  appId: "web:4dbbcdb889d103cc150080"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;