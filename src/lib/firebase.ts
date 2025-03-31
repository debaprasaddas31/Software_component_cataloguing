import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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
console.log('Initializing Firebase with config:', { ...firebaseConfig, apiKey: '***' });

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only if supported
let analytics = null;
isSupported().then(yes => yes && (analytics = getAnalytics(app)))
  .catch(e => console.log('Analytics not supported:', e));

// Add auth state change listener for debugging
auth.onAuthStateChanged((user) => {
  console.log('Auth state changed:', user ? `User ${user.email} signed in` : 'User signed out');
});

export { auth, db, analytics };
export const componentStorageName = 'components'; 