import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import {
    ApiResponse,
    LoginRequest,
    RegisterRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
    User,
    CreateTransactionRequest,
    CreateCategoryRequest,
    Transaction,
    Category,
} from '@/types';
import { tokenUtils } from '@/utils/tokenUtils';

// Use the API_URL from environment variables
const API_BASE_URL = API_URL || 'http://192.168.1.5:7000/moneyflow/api'; // Fallback for development

console.log('API_BASE_URL configured as:', API_BASE_URL);

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async config => {
        try {
            const token = await tokenUtils.getValidToken();
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('🔑 Adding JWT token to request');
            }
        } catch (error) {
            console.error('Error getting token:', error);
        }
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    response => response,
    async (error: any) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear auth data
            await AsyncStorage.removeItem('auth-token');
            // Note: You should also clear the auth store here
            console.log('Token expired, clearing auth data');
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: async (credentials: LoginRequest): Promise<{ user: User; accessToken: string }> => {
        console.log('🔐 Attempting login with JWT auth endpoint');
        const response = await api.post('/auth/login', credentials);
        const { accessToken, user } = response.data;
        
        // Store JWT token
        await AsyncStorage.setItem('auth-token', accessToken);
        console.log('✅ JWT token stored successfully');
        
        return { user, accessToken };
    },

    register: async (data: RegisterRequest): Promise<{ user: User; accessToken: string }> => {
        console.log('📝 Attempting registration with JWT auth endpoint:', data);
        console.log('Full URL will be:', `${API_BASE_URL}/auth/register`);
        const response = await api.post('/auth/register', data);
        const { accessToken, user } = response.data;
        
        // Store JWT token
        await AsyncStorage.setItem('auth-token', accessToken);
        console.log('✅ Registration successful, JWT token stored');
        
        return { user, accessToken };
    },

    verifyEmail: async (data: { email: string; code: string }): Promise<User> => {
        console.log('✉️ Verifying email with new auth endpoint');
        const response = await api.post('/auth/verify-email', data);
        return response.data.user;
    },

    debugVerifyByEmail: async (data: { email: string; token: string }): Promise<User> => {
        // Keep using the debug endpoint for development
        const response = await api.post('/users/debug/verify-by-email', data);
        return response.data;
    },

    resendVerification: async (
        data: ResendVerificationRequest
    ): Promise<{ message: string }> => {
        console.log('📤 Resending verification with new auth endpoint');
        const response = await api.post('/auth/resend-verification', data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        console.log('👋 Logging out and clearing auth data');
        await AsyncStorage.removeItem('auth-token');
        // Call backend logout endpoint for consistency
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.log('Logout endpoint error (non-critical):', error);
        }
    },

    getProfile: async (): Promise<User> => {
        console.log('👤 Getting user profile with JWT auth');
        const response = await api.get('/auth/profile');
        return response.data;
    },
};

// Transaction API
export const transactionApi = {
    getTransactions: async (): Promise<ApiResponse<Transaction[]>> => {
        const response = await api.get('/user-expense');
        return response.data;
    },

    createTransaction: async (
        data: CreateTransactionRequest
    ): Promise<ApiResponse<Transaction>> => {
        const endpoint =
            data.type === 'expense' ? '/user-expense' : '/user-income';
        const response = await api.post(endpoint, data);
        return response.data;
    },

    updateTransaction: async (
        id: string,
        data: Partial<CreateTransactionRequest>
    ): Promise<ApiResponse<Transaction>> => {
        const response = await api.patch(`/user-expense/${id}`, data);
        return response.data;
    },

    deleteTransaction: async (id: string): Promise<ApiResponse<void>> => {
        const response = await api.delete(`/user-expense/${id}`);
        return response.data;
    },
};

// Category API
export const categoryApi = {
    getCategories: async (): Promise<ApiResponse<Category[]>> => {
        const response = await api.get('/user-category');
        return response.data;
    },

    createCategory: async (
        data: CreateCategoryRequest
    ): Promise<ApiResponse<Category>> => {
        const response = await api.post('/user-category', data);
        return response.data;
    },

    updateCategory: async (
        id: string,
        data: Partial<CreateCategoryRequest>
    ): Promise<ApiResponse<Category>> => {
        const response = await api.patch(`/user-category/${id}`, data);
        return response.data;
    },

    deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
        const response = await api.delete(`/user-category/${id}`);
        return response.data;
    },
};

export default api;
