import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '@/types';

interface AuthStore extends AuthState {
    pendingVerificationEmail: string | null;
    pendingVerificationUserId: string | null;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setLoading: (loading: boolean) => void;
    setPendingVerification: (email: string | null, userId: string | null) => void;
    login: (user: User, token: string) => void;
    logout: () => void;
    clearAll: () => void;
    clearPendingVerification: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
            pendingVerificationEmail: null,
            pendingVerificationUserId: null,

            setUser: (user: User | null) => {
                const token = get().token;
                set({ user, isAuthenticated: !!(user && token) });
            },
            
            setToken: (token: string | null) => {
                const user = get().user;
                set({ token, isAuthenticated: !!(user && token) });
            },
            
            setLoading: (isLoading: boolean) => set({ isLoading }),
            
            setPendingVerification: (email: string | null, userId: string | null) =>
                set({ pendingVerificationEmail: email, pendingVerificationUserId: userId }),

            login: (user: User, token: string) => {
                // Store token in AsyncStorage (single source of truth)
                AsyncStorage.setItem('auth-token', token);
                
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                    pendingVerificationEmail: null,
                    pendingVerificationUserId: null,
                });
            },

            logout: () => {
                // Clear everything
                AsyncStorage.removeItem('auth-token');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                    pendingVerificationEmail: null,
                    pendingVerificationUserId: null,
                });
            },

            clearAll: () => {
                AsyncStorage.multiRemove(['auth-storage', 'auth-token']);
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                    pendingVerificationEmail: null,
                    pendingVerificationUserId: null,
                });
            },

            clearPendingVerification: () =>
                set({
                    pendingVerificationEmail: null,
                    pendingVerificationUserId: null,
                }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
