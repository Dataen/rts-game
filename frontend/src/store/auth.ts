import { create } from 'zustand';
import { persist } from "zustand/middleware";
import type { User } from '../types/User';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    exp: number;
}

interface AuthState {
    token: string | null;
    user: User | null;
    setToken: (token: string) => void;
    clearAuth: () => void;
    isLoggedIn: () => boolean;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,

            setToken: (token) => set({ token }),

            setUser: (user) => set({ user }),

            clearAuth: () => set({ token: null, user: null }),

            isLoggedIn: () => {
                const token = get().token;
                if (!token) return false;

                try {
                    const decoded = jwtDecode<DecodedToken>(token);
                    if (decoded.exp * 1000 < Date.now()) {
                        get().clearAuth();
                        return false;
                    }
                    return true;
                } catch {
                    get().clearAuth();
                    return false;
                }
            },
        }),
        {
            name: "authStore",
        }
    )
);

// Save the entire store state to localStorage on any change
useAuthStore.subscribe((state) => {
    localStorage.setItem("authStore", JSON.stringify(state));
});

const storedState = localStorage.getItem("authStore");
if (storedState) {
    const parsed = JSON.parse(storedState);
    useAuthStore.setState(parsed);
}