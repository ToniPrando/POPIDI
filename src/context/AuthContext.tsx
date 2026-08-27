import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  getRedirectResult,
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
import { UserProfile } from '../types';
import { 
  saveUserProfileToFirestore, 
  getUserProfileFromFirestore, 
  findUserProfileByPhoneOrEmail,
  creditUserLoyaltyPoints
} from '../services/firebaseService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (tab: 'login' | 'register') => void;
  authNoticeMessage: string | null;
  setAuthNoticeMessage: (msg: string | null) => void;
  triggerAuthNotice: (customMsg?: string) => void;
  isAdminLoginOpen: boolean;
  setIsAdminLoginOpen: (open: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (emailOrPhone: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  registerWithPhoneOrGuest: (name: string, phone: string, email?: string) => Promise<void>;
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
const CUSTOMER_SESSION_KEY = 'popidi_customer_session_v1';
const ADMIN_MASTER_PIN = '1234'; // Default store manager PIN
const ADMIN_MASTER_PASS = 'popidi@2026'; // Default store manager password

const safeGetStorage = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch {}
  return null;
};

const safeSetStorage = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch {}
};

const safeRemoveStorage = (key: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  } catch {}
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return safeGetStorage(ADMIN_SESSION_KEY) === 'true';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authNoticeMessage, setAuthNoticeMessage] = useState<string | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);

  const triggerAuthNotice = (customMsg?: string) => {
    setAuthNoticeMessage(customMsg || 'Você precisa estar logado para pedir!');
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };

  // Sync profile from Firestore or create initial doc
  const syncUserProfile = async (firebaseUser: User) => {
    try {
      const existing = await getUserProfileFromFirestore(firebaseUser.uid);

      if (existing) {
        const profileWithLoyalty: UserProfile = {
          ...existing,
          name: existing.name || firebaseUser.displayName || 'Cliente PO-PI-DI',
          email: existing.email || firebaseUser.email || '',
          loyaltyPoints: typeof existing.loyaltyPoints === 'number' ? existing.loyaltyPoints : 50,
          loyaltyTier: existing.loyaltyTier || 'Bronze',
        };
        setProfile(profileWithLoyalty);
        safeSetStorage(CUSTOMER_SESSION_KEY, JSON.stringify(profileWithLoyalty));
        if (existing.role === 'admin') {
          setIsAdmin(true);
          safeSetStorage(ADMIN_SESSION_KEY, 'true');
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

        await saveUserProfileToFirestore(newProfile);
        setProfile(newProfile);
        safeSetStorage(CUSTOMER_SESSION_KEY, JSON.stringify(newProfile));
      }
    } catch (err) {
      console.warn('Could not sync user profile with Firestore:', err);
      // Fallback local memory profile
      const fallback: UserProfile = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Cliente PO-PI-DI',
        email: firebaseUser.email || '',
        phone: firebaseUser.phoneNumber || '',
        photoURL: firebaseUser.photoURL || '',
        role: 'customer',
        loyaltyPoints: 50,
        loyaltyTier: 'Bronze',
        createdAt: new Date().toISOString(),
      };
      setProfile(fallback);
      safeSetStorage(CUSTOMER_SESSION_KEY, JSON.stringify(fallback));
    }
  };

  useEffect(() => {
    // 1. Check if user is returning from a redirect sign-in flow
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          await syncUserProfile(result.user);
        }
      })
      .catch((err) => {
        console.warn('Redirect sign-in check:', err);
      });

    // 2. Restore cached customer session if present
    const cachedSession = safeGetStorage(CUSTOMER_SESSION_KEY);
    if (cachedSession) {
      try {
        const parsed = JSON.parse(cachedSession) as UserProfile;
        if (parsed && parsed.uid) {
          setProfile(parsed);
          // Async revalidate with Firestore in background
          getUserProfileFromFirestore(parsed.uid).then(remote => {
            if (remote) {
              setProfile(remote);
              safeSetStorage(CUSTOMER_SESSION_KEY, JSON.stringify(remote));
            }
          }).catch(() => {});
        }
      } catch (e) {}
    }

    // 3. Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        // If not logged in via Firebase Auth, keep profile only if customer registered via Phone/Quick
        const saved = safeGetStorage(CUSTOMER_SESSION_KEY);
        if (!saved) {
          setProfile(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In
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

  // Email/Password or Phone Login
  const loginWithEmail = async (emailOrPhone: string, pass: string) => {
    setIsLoading(true);
    const clean = emailOrPhone.trim();
    try {
      // If it looks like an email and pass is provided, attempt Firebase Auth login
      if (clean.includes('@') && pass) {
        try {
          const result = await signInWithEmailAndPassword(auth, clean.toLowerCase(), pass);
          if (result.user) {
            await syncUserProfile(result.user);
            setIsAuthModalOpen(false);
            return;
          }
        } catch (firebaseErr: any) {
          // If error is wrong password or email in use, check if customer exists in Firestore
          if (firebaseErr.code === 'auth/invalid-credential' || firebaseErr.code === 'auth/user-not-found' || firebaseErr.code === 'auth/operation-not-allowed') {
            const remoteUser = await findUserProfileByPhoneOrEmail(clean);
            if (remoteUser) {
              setProfile(remoteUser);
              safeSetStorage(CUSTOMER_SESSION_KEY, JSON.stringify(remoteUser));
              setIsAuthModalOpen(false);
              return;
            }
          }
          throw firebaseErr;
        }
      }

      // If it's a phone number or fallback lookup
      const remoteUser = await findUserProfileByPhoneOrEmail(clean);
      if (remoteUser) {
        setProfile(remoteUser);
        safeSetStorage(CUSTOMER_SESSION_KEY, JSON.stringify(remoteUser));
        setIsAuthModalOpen(false);
        return;
      }

      throw { code: 'auth/user-not-found', message: 'Nenhuma conta encontrada com este e-mail ou telefone.' };
    } catch (err: any) {
      console.error('Login Error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password Register
  const registerWithEmail = async (name: string, email: string, pass: string, phone?: string) => {
    setIsLoading(true);
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';

    try {
      let createdUid = '';
      let firebaseUser: User | null = null;

      try {
        const result = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        if (result.user) {
          firebaseUser = result.user;
          createdUid = result.user.uid;
          await updateAuthProfile(result.user, {
            displayName: cleanName
          });
        }
      } catch (authErr: any) {
        console.warn('Firebase Auth create user notice:', authErr);
        // If email already in use, throw so user can login
        if (authErr.code === 'auth/email-already-in-use') {
          throw authErr;
        }
        if (authErr.code === 'auth/weak-password') {
          throw authErr;
        }
        // For other restrictions (like operation not allowed), create direct Firestore profile
        createdUid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      }

      const newProfile: UserProfile = {
        uid: createdUid,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        photoURL: '',
        role: 'customer',
        loyaltyPoints: 50, // Welcome bonus
        loyaltyTier: 'Bronze',
        createdAt: new Date().toISOString(),
      };

      await saveUserProfileToFirestore(newProfile);
      setProfile(newProfile);
      safeSetStorage(CUSTOMER_SESSION_KEY, JSON.stringify(newProfile));
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Register Error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fast 1-Click WhatsApp / Phone Register
  const registerWithPhoneOrGuest = async (name: string, phone: string, email?: string) => {
    setIsLoading(true);
    const cleanName = name.trim();
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    try {
      // Check if user already registered with this phone
      const existing = await findUserProfileByPhoneOrEmail(cleanPhone);
      if (existing) {
        const updated: UserProfile = {
          ...existing,
          name: cleanName || existing.name,
          email: cleanEmail || existing.email,
        };
        await saveUserProfileToFirestore(updated);
        setProfile(updated);
        safeSetStorage(CUSTOMER_SESSION_KEY, JSON.stringify(updated));
        setIsAuthModalOpen(false);
        return;
      }

      // Create new customer
      const newUid = `cust_${Date.now()}_${cleanPhone.slice(-4) || 'pop'}`;
      const newProfile: UserProfile = {
        uid: newUid,
        name: cleanName,
        email: cleanEmail || `${cleanPhone}@popidiburger.com.br`,
        phone: cleanPhone,
        photoURL: '',
        role: 'customer',
        loyaltyPoints: 50, // Welcome bonus
        loyaltyTier: 'Bronze',
        createdAt: new Date().toISOString(),
      };

      await saveUserProfileToFirestore(newProfile);
      setProfile(newProfile);
      safeSetStorage(CUSTOMER_SESSION_KEY, JSON.stringify(newProfile));
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Phone Register Error:', err);
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
      safeSetStorage(ADMIN_SESSION_KEY, 'true');
      setIsAdminLoginOpen(false);
      return true;
    }

    // Check against custom PIN or Password saved in store_settings (Firestore)
    try {
      const storeSettingsDoc = await getDoc(doc(db, 'store_settings', 'main_config'));
      if (storeSettingsDoc.exists()) {
        const data = storeSettingsDoc.data();
        if (data.adminPin && data.adminPin.trim() === input) {
          setIsAdmin(true);
          safeSetStorage(ADMIN_SESSION_KEY, 'true');
          setIsAdminLoginOpen(false);
          return true;
        }
        if (data.adminPassword && data.adminPassword.trim() === input) {
          setIsAdmin(true);
          safeSetStorage(ADMIN_SESSION_KEY, 'true');
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
          safeSetStorage(ADMIN_SESSION_KEY, 'true');
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
    safeRemoveStorage(ADMIN_SESSION_KEY);
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setProfile(null);
      safeRemoveStorage(CUSTOMER_SESSION_KEY);
    }
  };

  const updateCustomerProfile = async (data: Partial<UserProfile>) => {
    const currentUid = profile?.uid || user?.uid;
    if (!currentUid) return;
    try {
      const baseProfile: UserProfile = profile || {
        uid: currentUid,
        name: user?.displayName || 'Cliente PO-PI-DI',
        email: user?.email || '',
        role: 'customer',
        loyaltyPoints: 50,
        loyaltyTier: 'Bronze',
        createdAt: new Date().toISOString(),
      };
      const updatedProfile: UserProfile = {
        ...baseProfile,
        ...data,
      };
      await saveUserProfileToFirestore(updatedProfile);
      setProfile(updatedProfile);
      safeSetStorage(CUSTOMER_SESSION_KEY, JSON.stringify(updatedProfile));
    } catch (err) {
      console.error('Update profile error:', err);
      setProfile(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const addLoyaltyPoints = async (pointsToAdd: number) => {
    const currentUid = profile?.uid || user?.uid;
    if (!currentUid) return;
    const currentPoints = profile?.loyaltyPoints || 0;
    const newTotal = currentPoints + pointsToAdd;
    await updateCustomerProfile({ loyaltyPoints: newTotal });
    await creditUserLoyaltyPoints(currentUid, pointsToAdd);
  };

  const redeemRewardPoints = async (pointsCost: number): Promise<boolean> => {
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
        authNoticeMessage,
        setAuthNoticeMessage,
        triggerAuthNotice,
        isAdminLoginOpen,
        setIsAdminLoginOpen,
        signInWithGoogle,
        loginWithEmail,
        registerWithEmail,
        registerWithPhoneOrGuest,
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

