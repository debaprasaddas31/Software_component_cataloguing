import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCnMGN-MqITrGXLuM8mlvFhGFINUWRiGX4",
  authDomain: "software-component-catal-db4bc.firebaseapp.com",
  projectId: "software-component-catal-db4bc",
  storageBucket: "software-component-catal-db4bc.firebasestorage.app",
  messagingSenderId: "245371622245",
  appId: "1:245371622245:web:db8e0c1b029f444a9f878c",
  measurementId: "G-Y3MW0ZZRKV"
};

// Initialize Firebase
console.log('Initializing Firebase with config:', { 
  ...firebaseConfig, 
  apiKey: '***',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence for Firestore
// This helps with intermittent connection issues
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence');
    }
  });
} catch (error) {
  console.error("Error enabling persistence:", error);
}

// Constants for collection names
export const componentStorageName = 'components';
export const usersCollectionName = 'users';
export const categoriesCollectionName = 'categories';

// Initialize Analytics only if supported
let analytics = null;
isSupported().then(yes => yes && (analytics = getAnalytics(app)))
  .catch(e => console.log('Analytics not supported:', e));

// Add auth state change listener for debugging
auth.onAuthStateChanged((user) => {
  console.log('Auth state changed:', user ? `User ${user.email} signed in` : 'User signed out');
});

// Check if we can access Firestore
try {
  db.toJSON(); // Simple way to test Firestore connection
  console.log("Firestore connection established successfully");
} catch (err) {
  console.error("Error connecting to Firestore:", err);
}

// Export Firebase instances
export { auth, db, analytics }; 