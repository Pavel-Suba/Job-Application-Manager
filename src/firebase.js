import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAWf5cLo4vCNyeH8gP0JIfC1XTciR-TgSQ",
    authDomain: "job-application-manager-236f4.firebaseapp.com",
    projectId: "job-application-manager-236f4",
    storageBucket: "job-application-manager-236f4.firebasestorage.app",
    messagingSenderId: "85101949386",
    appId: "1:85101949386:web:3a23745f0162da84f0df33"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
