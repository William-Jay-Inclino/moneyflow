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

// Request interceptor to log all requests
api.interceptors.request.use(
    config => {
        console.log('📤 Axios Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`,
            headers: config.headers,
            data: config.data
        });
        return config;
    },
    error => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    response => response,
    async (error: any) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear auth data and logout
            await AsyncStorage.removeItem('auth-token');
            
            // Import auth store and logout user
            const { useAuthStore } = await import('@/store/authStore');
            const { logout } = useAuthStore.getState();
            logout();
            
            console.log('🔄 401 Unauthorized - Token expired, user logged out');
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

// Transaction API - Updated to match backend user-specific endpoints
export const transactionApi = {
    getExpenses: async (userId: string, year: number, month: number): Promise<any[]> => {
        const response = await api.get(`/users/${userId}/expenses?year=${year}&month=${month}`);
        return response.data;
    },

    createExpense: async (userId: string, data: {
        category_id: number;
        cost: string;
        notes?: string;
        expense_date?: string;
    }): Promise<any> => {
        const response = await api.post(`/users/${userId}/expenses`, data);
        return response.data;
    },

    updateExpense: async (userId: string, expenseId: string, data: {
        category_id?: number;
        cost?: string;
        notes?: string;
        expense_date?: string;
    }): Promise<any> => {
        const response = await api.patch(`/users/${userId}/expenses/${expenseId}`, data);
        return response.data;
    },

    deleteExpense: async (userId: string, expenseId: string): Promise<void> => {
        await api.delete(`/users/${userId}/expenses/${expenseId}`);
    },

    getExpenseSummary: async (userId: string, startDate?: string, endDate?: string): Promise<any> => {
        let url = `/users/${userId}/expenses/summary`;
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (params.toString()) url += `?${params.toString()}`;
        
        const response = await api.get(url);
        return response.data;
    },

    // Legacy methods for backwards compatibility
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

// Category API - Updated to match backend user-specific endpoints  
export const categoryApi = {
    // Get all global categories (from the new Category module)
    getAllCategories: async (type?: 'EXPENSE' | 'INCOME'): Promise<Category[]> => {
        let url = '/categories';
        if (type) url += `?type=${type}`;
        
        const response = await api.get(url);
        return response.data;
    },

    getCategories: async (userId?: string): Promise<ApiResponse<Category[]>> => {
        // If userId is provided, use user-specific endpoint
        if (userId) {
            const response = await api.get(`/users/${userId}/categories`);
            return { success: true, data: response.data };
        }
        // Fallback to old endpoint for backwards compatibility
        const response = await api.get('/user-category');
        return response.data;
    },

    getUserCategories: async (userId: string, type?: 'EXPENSE' | 'INCOME'): Promise<Category[]> => {
        let url = `/users/${userId}/categories`;
        if (type) url += `?type=${type}`;
        
        const response = await api.get(url);
        return response.data;
    },

    // Assign a global category to a user
    assignCategoryToUser: async (userId: string, categoryId: number): Promise<any> => {
        console.log('🔗 categoryApi.assignCategoryToUser called:', { userId, categoryId });
        console.log('📤 Making POST request to:', `/users/${userId}/categories`);
        console.log('📦 Request payload:', { category_id: categoryId });
        
        try {
            const response = await api.post(`/users/${userId}/categories`, {
                category_id: categoryId
            });
            console.log('✅ assignCategoryToUser SUCCESS:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ assignCategoryToUser ERROR:', error);
            console.error('❌ Full error details:', {
                message: error?.message,
                status: error?.response?.status,
                statusText: error?.response?.statusText,
                url: error?.config?.url,
                method: error?.config?.method,
                data: error?.response?.data,
                headers: error?.config?.headers
            });
            throw error;
        }
    },

    // Remove a category from a user
    removeCategoryFromUser: async (userId: string, categoryId: number): Promise<void> => {
        console.log('🗑️ categoryApi.removeCategoryFromUser called:', { userId, categoryId });
        console.log('📤 Making DELETE request to:', `/users/${userId}/categories/${categoryId}`);
        
        try {
            const response = await api.delete(`/users/${userId}/categories/${categoryId}`);
            console.log('✅ removeCategoryFromUser SUCCESS');
            return response.data;
        } catch (error: any) {
            console.error('❌ removeCategoryFromUser ERROR:', error);
            console.error('❌ Full error details:', {
                message: error?.message,
                status: error?.response?.status,
                statusText: error?.response?.statusText,
                url: error?.config?.url,
                method: error?.config?.method,
                data: error?.response?.data,
                headers: error?.config?.headers
            });
            throw error;
        }
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

// Income API - Following the same pattern as expense API
export const incomeApi = {
    getIncome: async (userId: string, year: number, month: number): Promise<any[]> => {
        const response = await api.get(`/users/${userId}/income?year=${year}&month=${month}`);
        return response.data;
    },

    addIncome: async (userId: string, data: {
        category_id: number;
        amount: string;
        notes?: string;
        income_date?: string;
    }): Promise<any> => {
        const response = await api.post(`/users/${userId}/income`, data);
        return response.data;
    },

    updateIncome: async (userId: string, incomeId: string, data: {
        category_id?: number;
        amount?: string;
        notes?: string;
        income_date?: string;
    }): Promise<any> => {
        const response = await api.patch(`/users/${userId}/income/${incomeId}`, data);
        return response.data;
    },

    deleteIncome: async (userId: string, incomeId: string): Promise<void> => {
        await api.delete(`/users/${userId}/income/${incomeId}`);
    },

    getIncomeSummary: async (userId: string, startDate?: string, endDate?: string): Promise<any> => {
        let url = `/users/${userId}/income/summary`;
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (params.toString()) url += `?${params.toString()}`;
        
        const response = await api.get(url);
        return response.data;
    },
};

export default api;
