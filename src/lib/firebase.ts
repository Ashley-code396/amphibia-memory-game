// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"; 


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAkcbeQ8nLzk36fJX3RFEe2e46uJ59kO0k",
  authDomain: "amphibia-memory-game.firebaseapp.com",
  projectId: "amphibia-memory-game", 
  storageBucket: "amphibia-memory-game.firebasestorage.app",
  messagingSenderId: "404204381983",
  appId: "1:404204381983:web:ef3654b91bc534f66e722a",
  measurementId: "G-ZX9ZX1P9D2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Only initialize analytics in the browser and if supported
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  });
}

export const auth = getAuth(app);
