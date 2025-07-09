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
    login: (user: User, token?: string) => void;
    logout: () => void;
    clearPendingVerification: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        set => ({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
            pendingVerificationEmail: null,
            pendingVerificationUserId: null,

            setUser: (user: User | null) =>
                set({ user, isAuthenticated: !!user }),
            setToken: (token: string | null) => set({ token }),
            setLoading: (isLoading: boolean) => set({ isLoading }),
            setPendingVerification: (email: string | null, userId: string | null) =>
                set({ pendingVerificationEmail: email, pendingVerificationUserId: userId }),

            login: (user: User, token: string = 'temp-token') =>
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                    pendingVerificationEmail: null,
                    pendingVerificationUserId: null,
                }),

            logout: () =>
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                    pendingVerificationEmail: null,
                    pendingVerificationUserId: null,
                }),

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
