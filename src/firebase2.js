
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBU_hBGe6X0DyQj-uDxeK3wCJ8G1kkvJFQ",
  authDomain: "yourehere-c9bb4.firebaseapp.com",
  projectId: "yourehere-c9bb4",
  storageBucket: "yourehere-c9bb4.appspot.com",
  messagingSenderId: "500648317755",
  appId: "1:500648317755:web:053c59ee949ca750f1dd1e",
  measurementId: "G-MEDCY0RQ3N"
  };

  

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
