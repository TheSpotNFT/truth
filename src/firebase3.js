import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously as firebaseSignInAnonymously } from "firebase/auth";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyA-7ELypnxEXoNR_7AONIrDbb364Qzx4no",
  authDomain: "recipecomments.firebaseapp.com",
  projectId: "recipecomments",
  storageBucket: "recipecomments.appspot.com",
  messagingSenderId: "512186795595",
  appId: "1:512186795595:web:1275903e623dc7692bafce",
  measurementId: "G-52ZXXGC956"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Function to sign in with Firebase Anonymous Authentication
async function signInAnonymously() {
  try {
    await firebaseSignInAnonymously(auth);
    console.log("Signed in anonymously");
  } catch (error) {
    console.error("Error signing in anonymously:", error);
  }
}

export { db, auth, signInAnonymously };
