import { create } from 'zustand';
import { 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'user' | 'admin';
  createdAt: any;
  lastLogin: any;
  provider?: string;
  status?: 'active' | 'blocked';
  mobile?: string;
  totalOrders?: number;
  totalSpend?: number;
}

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  loginWithGoogle: () => Promise<boolean>;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (email: string, password: string, displayName?: string, mobile?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  syncUserToFirestore: (user: User, provider?: string, extraData?: { displayName?: string, mobile?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAdmin: typeof window !== 'undefined' ? (localStorage.getItem('admin_session') === 'true') : false,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  
  syncUserToFirestore: async (user: User, provider = 'password', extraData = {}) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      const adminEmails = ['praduman589@gmail.com', 'admin@pradumankart.com', 'princemahto131@gmail.com', 'princewebdev01@gmail.com'];
      const isPrivileged = adminEmails.includes(user.email || '');

      if (!userSnap.exists()) {
        const newUser: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: extraData.displayName || user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: user.photoURL || '',
          role: isPrivileged ? 'admin' : 'user',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          provider,
          status: 'active',
          mobile: extraData.mobile || '',
          totalOrders: 0,
          totalSpend: 0
        };
        await setDoc(userRef, newUser);
        if (isPrivileged) set({ isAdmin: true });
      } else {
        const userData = userSnap.data() as UserProfile;
        
        // If blocked, log them out
        if (userData.status === 'blocked') {
          await signOut(auth);
          set({ user: null, isAdmin: false });
          throw new Error('Your account has been blocked. Please contact support.');
        }

        if (userData.role === 'admin' || isPrivileged) {
          set({ isAdmin: true });
        }

        const updatePayload: any = {
          lastLogin: serverTimestamp(),
          provider: provider
        };

        if (extraData.mobile) updatePayload.mobile = extraData.mobile;
        if (extraData.displayName) updatePayload.displayName = extraData.displayName;

        await setDoc(userRef, updatePayload, { merge: true });
      }
    } catch (e) {
      console.error('Error syncing user to Firestore:', e);
      throw e;
    }
  },

  loginWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await get().syncUserToFirestore(result.user, 'google');
      set({ user: result.user });
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },
  
  loginWithEmail: async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await get().syncUserToFirestore(result.user);
      set({ user: result.user });
      return true;
    } catch (error) {
      console.error('Email login error:', error);
      throw error;
    }
  },

  registerWithEmail: async (email: string, password: string, displayName?: string, mobile?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await get().syncUserToFirestore(result.user, 'password', { displayName, mobile });
      set({ user: result.user });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      localStorage.removeItem('admin_session');
      localStorage.removeItem('admin_email');
      await fetch('/api/admin/logout', { method: 'POST' });
      await signOut(auth);
      set({ user: null, isAdmin: false });
    } catch (e) {
      console.error('Logout error:', e);
      // Fallback: still clear client state
      localStorage.removeItem('admin_session');
      localStorage.removeItem('admin_email');
      await signOut(auth);
      set({ user: null, isAdmin: false });
    }
  },
}));
