import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCcZ-U_XojIORbaJnSAixhooP8vpIX7GNY",
  appId: "1:829505688450:web:1e93bdf12d57197e69f59b",
  messagingSenderId: "829505688450",
  projectId: "uno-game-8cdb7",
  databaseURL: "https://uno-game-8cdb7-default-rtdb.firebaseio.com",
  authDomain: "uno-game-8cdb7.firebaseapp.com",
  storageBucket: "uno-game-8cdb7.firebasestorage.app",
  measurementId: "G-XK0TTRWDLG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export default app;
