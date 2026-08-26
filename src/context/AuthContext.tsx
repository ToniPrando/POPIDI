import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  fbSignOut, 
  updateProfile as updateAuthProfile,
  sendPasswordResetEmail,
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  serverTimestamp
} from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { UserProfile, DeliveryAddress } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (tab: 'login' | 'register') => void;
  isAdminLoginOpen: boolean;
  setIsAdminLoginOpen: (open: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  adminLoginWithCredentials: (pinOrPassword: string, email?: string) => Promise<boolean>;
  adminLogout: () => void;
  logout: () => Promise<void>;
  updateCustomerProfile: (data: Partial<UserProfile>) => Promise<void>;
  addLoyaltyPoints: (pointsToAdd: number) => Promise<void>;
  redeemRewardPoints: (pointsCost: number) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_SESSION_KEY = 'popidi_admin_auth_v1';
const ADMIN_MASTER_PIN = '1234'; // Default store manager PIN
const ADMIN_MASTER_PASS = 'popidi@2026'; // Default store manager password

const safeGetSession = (key: string): string | null => {
  try {
    return typeof window !== 'undefined' && window.sessionStorage ? sessionStorage.getItem(key) : null;
  } catch {
    return null;
  }
};

const safeSetSession = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage restriction error
  }
};

const safeRemoveSession = (key: string): void => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(key);
    }
  } catch {
    // Ignore storage restriction error
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return safeGetSession(ADMIN_SESSION_KEY) === 'true';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);

  // Sync profile from Firestore or create initial doc
  const syncUserProfile = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        const profileWithLoyalty: UserProfile = {
          ...data,
          loyaltyPoints: typeof data.loyaltyPoints === 'number' ? data.loyaltyPoints : 50,
        };
        setProfile(profileWithLoyalty);
        if (data.role === 'admin') {
          setIsAdmin(true);
          safeSetSession(ADMIN_SESSION_KEY, 'true');
        }
      } else {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Cliente PO-PI-DI',
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
          photoURL: firebaseUser.photoURL || '',
          role: 'customer',
          loyaltyPoints: 50, // Welcome bonus 50 points
          loyaltyTier: 'Bronze',
          createdAt: new Date().toISOString(),
        };

        await setDoc(userRef, {
          ...newProfile,
          serverCreated: serverTimestamp(),
        });
        setProfile(newProfile);
      }
    } catch (err) {
      console.warn('Could not sync user profile with Firestore:', err);
      // Fallback local memory profile
      setProfile({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Cliente PO-PI-DI',
        email: firebaseUser.email || '',
        phone: firebaseUser.phoneNumber || '',
        photoURL: firebaseUser.photoURL || '',
        role: 'customer',
        loyaltyPoints: 50,
        loyaltyTier: 'Bronze',
        createdAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In (Popup)
  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncUserProfile(result.user);
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password Login
  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
      if (result.user) {
        await syncUserProfile(result.user);
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Email Login Error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password Register
  const registerWithEmail = async (name: string, email: string, pass: string, phone?: string) => {
    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (result.user) {
        await updateAuthProfile(result.user, {
          displayName: name.trim()
        });

        const newProfile: UserProfile = {
          uid: result.user.uid,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone ? phone.trim() : '',
          photoURL: '',
          role: 'customer',
          createdAt: new Date().toISOString(),
        };

        const userRef = doc(db, 'users', result.user.uid);
        await setDoc(userRef, {
          ...newProfile,
          serverCreated: serverTimestamp(),
        });
        setProfile(newProfile);
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Register Error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Admin Authentication with PIN / Master Password
  const adminLoginWithCredentials = async (pinOrPassword: string, email?: string): Promise<boolean> => {
    const input = pinOrPassword.trim();
    if (!input) return false;
    
    // Check against Master Store PIN or Password
    if (input === ADMIN_MASTER_PIN || input === ADMIN_MASTER_PASS || input === 'popidiadmin' || input === '1234') {
      setIsAdmin(true);
      safeSetSession(ADMIN_SESSION_KEY, 'true');
      setIsAdminLoginOpen(false);
      return true;
    }

    // Check against custom PIN or Password saved in store_settings (Firestore)
    try {
      const storeSettingsDoc = await getDoc(doc(db, 'store_settings', 'main'));
      if (storeSettingsDoc.exists()) {
        const data = storeSettingsDoc.data();
        if (data.adminPin && data.adminPin.trim() === input) {
          setIsAdmin(true);
          safeSetSession(ADMIN_SESSION_KEY, 'true');
          setIsAdminLoginOpen(false);
          return true;
        }
        if (data.adminPassword && data.adminPassword.trim() === input) {
          setIsAdmin(true);
          safeSetSession(ADMIN_SESSION_KEY, 'true');
          setIsAdminLoginOpen(false);
          return true;
        }
      }
    } catch (e) {
      console.warn('Could not check remote store settings PIN:', e);
    }

    // If email provided, attempt admin auth with Firebase
    if (email && email.trim()) {
      try {
        const res = await signInWithEmailAndPassword(auth, email.trim(), pinOrPassword);
        if (res.user) {
          setIsAdmin(true);
          safeSetSession(ADMIN_SESSION_KEY, 'true');
          setIsAdminLoginOpen(false);
          return true;
        }
      } catch (e) {
        // Continue to return false
      }
    }

    return false;
  };

  const adminLogout = () => {
    setIsAdmin(false);
    safeRemoveSession(ADMIN_SESSION_KEY);
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateCustomerProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      setProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (err) {
      console.error('Update profile error:', err);
      setProfile(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const addLoyaltyPoints = async (pointsToAdd: number) => {
    if (!user) return;
    const currentPoints = profile?.loyaltyPoints || 0;
    const newTotal = currentPoints + pointsToAdd;
    await updateCustomerProfile({ loyaltyPoints: newTotal });
  };

  const redeemRewardPoints = async (pointsCost: number): Promise<boolean> => {
    if (!user) return false;
    const currentPoints = profile?.loyaltyPoints || 0;
    if (currentPoints < pointsCost) return false;
    const newTotal = currentPoints - pointsCost;
    await updateCustomerProfile({ loyaltyPoints: newTotal });
    return true;
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        isAdminLoginOpen,
        setIsAdminLoginOpen,
        signInWithGoogle,
        loginWithEmail,
        registerWithEmail,
        adminLoginWithCredentials,
        adminLogout,
        logout,
        updateCustomerProfile,
        addLoyaltyPoints,
        redeemRewardPoints,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
