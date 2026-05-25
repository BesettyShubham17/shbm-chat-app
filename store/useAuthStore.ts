import { create } from "zustand";

interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  status?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// Initialize from localStorage if present
const storedUser = typeof window !== "undefined" ? localStorage.getItem("auth_user") : null;
const initialUser: User | null = storedUser ? JSON.parse(storedUser) : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  isAuthenticated: !!initialUser,
  setUser: (user) => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("auth_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("auth_user");
      }
    }
    set({ user, isAuthenticated: !!user });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_user");
    }
    set({ user: null, isAuthenticated: false });
  },
}));
