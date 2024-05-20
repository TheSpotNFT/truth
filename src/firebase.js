// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCWZZysC3zMNcvpCNOceBtm1kAGzN-A5-c",
    authDomain: "avaxcooks-2e14c.firebaseapp.com",
    databaseURL: "https://avaxcooks-2e14c-default-rtdb.firebaseio.com",
    projectId: "avaxcooks-2e14c",
    storageBucket: "avaxcooks-2e14c.appspot.com",
    messagingSenderId: "988148961650",
    appId: "1:988148961650:web:1fbf40349d25f892b80deb",
    measurementId: "G-9GV1GY3VKL"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
