import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  subscriptionStatus: string;
  totalPaid?: number;
  planName?: string;
  walletBalance?: number;
  totalReferrals?: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
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
