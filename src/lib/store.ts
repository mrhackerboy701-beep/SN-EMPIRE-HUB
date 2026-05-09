import { create } from 'zustand';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface User {
  id: string; // Firebase uid
  name: string;
  email: string;
  role: string;
  status: string;
  subscriptionStatus: string;
  totalPaid?: number;
  planName?: string;
  walletBalance?: number;
  mobile?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  loading: true,
  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, loading: false });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, loading: false });
  },
  updateUser: (updates) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updates };
      localStorage.setItem('user', JSON.stringify(newUser));
      return { user: newUser };
    });
  }
}));

// Initialize Firebase Auth listener
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    // get or create user doc
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      let userData: any;
      if (!userSnap.exists()) {
        userData = {
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email,
          role: firebaseUser.email === 'shivamnirmalkar26@gmail.com' ? 'admin' : 'user',
          status: 'active',
          subscriptionStatus: 'inactive',
          totalPaid: 0,
          walletBalance: 0,
          joinDate: serverTimestamp()
        };
        await setDoc(userRef, userData);
      } else {
        userData = userSnap.data();
      }
      userData.id = firebaseUser.uid;
      const token = await firebaseUser.getIdToken();
      useAuthStore.getState().login(token, userData as User);
    } catch(err) {
      console.error(err);
      useAuthStore.getState().logout();
    }
  } else {
    useAuthStore.getState().logout();
  }
});
