import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ApiResponse,
    LoginRequest,
    RegisterRequest,
    User,
    CreateTransactionRequest,
    CreateCategoryRequest,
    Transaction,
    Category,
} from '@/types';

const API_BASE_URL = 'http://localhost:3000'; // Update this to your API URL

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
    login: async (
        credentials: LoginRequest
    ): Promise<ApiResponse<{ user: User; token: string }>> => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    register: async (
        data: RegisterRequest
    ): Promise<ApiResponse<{ user: User; token: string }>> => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
        await AsyncStorage.removeItem('auth-token');
    },

    getProfile: async (): Promise<ApiResponse<User>> => {
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
