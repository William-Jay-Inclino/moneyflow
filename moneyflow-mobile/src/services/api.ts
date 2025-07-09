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
            const token = await AsyncStorage.getItem('auth-token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
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
            // Token expired or invalid
            await AsyncStorage.removeItem('auth-token');
            // You might want to redirect to login here
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: async (credentials: LoginRequest): Promise<User> => {
        const response = await api.post('/users/login', credentials);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<User> => {
        console.log('Attempting to register with:', data);
        console.log('Full URL will be:', `${API_BASE_URL}/users/register`);
        const response = await api.post('/users/register', data);
        console.log('Registration response:', response.data);
        return response.data;
    },

    verifyEmail: async (data: VerifyEmailRequest): Promise<User> => {
        const response = await api.post('/users/verify-email', data);
        return response.data;
    },

    resendVerification: async (
        data: ResendVerificationRequest
    ): Promise<{ message: string }> => {
        const response = await api.post('/users/resend-verification', data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await AsyncStorage.removeItem('auth-token');
    },

    getProfile: async (userId: string): Promise<User> => {
        const response = await api.get(`/users/${userId}`);
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
