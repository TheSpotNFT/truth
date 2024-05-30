
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-7ELypnxEXoNR_7AONIrDbb364Qzx4no",
  authDomain: "recipecomments.firebaseapp.com",
  projectId: "recipecomments",
  storageBucket: "recipecomments.appspot.com",
  messagingSenderId: "512186795595",
  appId: "1:512186795595:web:1275903e623dc7692bafce",
  measurementId: "G-52ZXXGC956"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
