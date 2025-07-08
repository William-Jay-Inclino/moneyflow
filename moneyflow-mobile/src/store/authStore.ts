import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '@/types';

interface AuthStore extends AuthState {
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setLoading: (loading: boolean) => void;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        set => ({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,

            setUser: (user: User | null) =>
                set({ user, isAuthenticated: !!user }),
            setToken: (token: string | null) => set({ token }),
            setLoading: (isLoading: boolean) => set({ isLoading }),

            login: (user: User, token: string) =>
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                }),

            logout: () =>
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
