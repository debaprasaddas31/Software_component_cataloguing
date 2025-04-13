import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db, usersCollectionName } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Extended user interface with additional fields
interface UserData {
  uid: string;
  email: string | null;
  name: string;
  role: 'admin' | 'regular';
  createdAt: Date;
  lastLogin?: Date;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, usersCollectionName, firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: userData.name,
          role: userData.role || 'regular',
          createdAt: userData.createdAt?.toDate() || new Date(),
          lastLogin: userData.lastLogin?.toDate()
        } as UserData;
      } else {
        // If no user document exists yet but the user is authenticated
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: '',
          role: 'regular',
          createdAt: new Date()
        } as UserData;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await fetchUserData(firebaseUser);
          setUser(userData);
        } catch (error) {
          console.error('Error setting user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signIn: async (email: string, password: string) => {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Update last login timestamp
      if (result.user) {
        await setDoc(
          doc(db, usersCollectionName, result.user.uid), 
          { lastLogin: new Date() }, 
          { merge: true }
        );
      }
    },
    signUp: async (email: string, password: string, name: string) => {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, usersCollectionName, firebaseUser.uid), {
        name,
        email,
        role: 'regular',
        createdAt: new Date(),
        lastLogin: new Date()
      });
    },
    signOut: async () => {
      await firebaseSignOut(auth);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}