import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

    const firebaseConfig = {
    apiKey: "AIzaSyCjJ1xKTRipvnzVmYyLYyu5hei-ky3ZJiE",
    authDomain: "playviecartweb.firebaseapp.com",
    projectId: "playviecartweb",
    storageBucket: "playviecartweb.firebasestorage.app",
    messagingSenderId: "767696021634",
    appId: "1:767696021634:web:f6d7d8b83c13e5edfeec9b",
    measurementId: "G-6390VQ0HPR"
    };

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
