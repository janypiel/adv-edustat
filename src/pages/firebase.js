import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database'; // Import getDatabase from firebase/database
import { getFirestore } from 'firebase/firestore'; // Import getFirestore from firebase/firestore

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClMGq5vsQlGwFnRFqsS-U6ZuIU_DSHzqg",
  authDomain: "edustat-adv.firebaseapp.com",
  projectId: "edustat-adv",
  storageBucket: "edustat-adv.appspot.com",
  messagingSenderId: "276102079217",
  appId: "1:276102079217:web:45b3225e14e1927861ff50",
  measurementId: "G-6J90FVNTCT"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Get a reference to the Firebase Realtime Database service
const database = getDatabase(app);

// Get a reference to the Firestore service
const firestore = getFirestore(app);

export { app, database, firestore }; // Export app, database, and firestore