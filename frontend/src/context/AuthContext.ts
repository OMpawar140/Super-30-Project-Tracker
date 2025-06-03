import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  type User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Login with email and password
  const login = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Signup with email and password
  const signup = async (email: string, password: string, displayName?: string): Promise<void> => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name if provided
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
  };

  // Login with Google
  const loginWithGoogle = async (): Promise<void> => {
    await signInWithPopup(auth, googleProvider);
  };

  // Logout
  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };

  // Get ID token for API calls
  const getIdToken = async (): Promise<string | null> => {
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    resetPassword,
    getIdToken
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    !loading && children
  );
};