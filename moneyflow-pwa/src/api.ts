import axios from 'axios';
import type { CashFlowData, Category, Expense, User } from './types';
import { get_auth_user_in_local_storage, showToast } from './utils/helpers';
import { AUTH_KEY } from './utils/config';

const API_URL = import.meta.env.VITE_API_URL
console.log('API_URL', API_URL);

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});


// Single request interceptor for auth and logging
api.interceptors.request.use(
    async config => {
        try {
            const auth_user = get_auth_user_in_local_storage()
            
            if (auth_user && auth_user.token && config.headers) {
                config.headers.Authorization = `Bearer ${auth_user.token}`;
            }
            
            // Simple logging
            console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
        } catch (error) {
            console.error('❌ Request interceptor error:', error);
        }
        return config;
    },
    error => Promise.reject(error)
);


// Response interceptor for error handling
api.interceptors.response.use(
    response => {
        console.log(`✅ ${response.status} ${response.config.url}`);
        return response;
    },
    async (error: any) => {
        console.error(`❌ ${error.response?.status || 'Network Error'} ${error.config?.url}`);

        console.log('error', error);
        
        // 401 = immediate logout (industry standard)
        if (error.response?.status === 401) {

            const errorMessage = error.response?.data?.message;

            // Don't reload on login-related errors - let the login component handle them
            if(errorMessage === "Invalid email or password" || 
               errorMessage === "Please verify your email address") {
                // These errors will be caught by the login component
            } else {
                console.log('🔒 401 Unauthorized - Logging out user');
                
                // Clear token
                localStorage.removeItem(AUTH_KEY);
                
                // reload the page
                window.location.reload();
            }
            
        }
        
        return Promise.reject(error);
    }
);

export async function api_health_check() {
    if (!API_URL) {
        console.error('API_URL is not set in environment variables');
        return false;
    }

    try {
        const baseUrl = API_URL.replace(/\/+$/, '');
        const response = await axios.get(`${baseUrl}/health-check`);
        console.log(response.data);
    } catch (error) {
        console.error('API health check failed:', error);
        return false;
    }
}

export const authApi = {
    login: async (credentials: { email: string; password: string }): Promise<{ user: User; accessToken: string }> => {
        const response = await api.post('/auth/login', credentials);
        console.log('response', response.data);
        const { accessToken, user } = response.data;
        return { user, accessToken };
    },
    register: async (data: { email: string, password: string }): Promise<{ user: User; accessToken: string }> => {
        const response = await api.post('/auth/register', data);
        const { accessToken, user } = response.data;
        return { user, accessToken };
    },

    verifyEmail: async (data: { email: string; code: string }): Promise<User> => {
        const response = await api.post('/auth/verify-email', data);
        return response.data.user;
    },

    resendVerification: async (data: { email: string }): Promise<{ message: string }> => {
        const response = await api.post('/auth/resend-verification', data);
        return response.data;
    },

    getProfile: async (): Promise<User> => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    changePassword: async (oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.post('/auth/change-password', { oldPassword, newPassword });
        return response.data;
    },

    forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    getUserIdByEmail: async (email: string): Promise<{ userId: string }> => {
        const response = await api.post('/auth/get-user-id', { email });
        return response.data;
    },
}

export const expenseApi = {
    getExpenses: async (userId: string, year: number, month: number): Promise<Expense[]> => {
        const response = await api.get(`/users/${userId}/expenses?year=${year}&month=${month}`);
        console.log('response expense', response.data);
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
    deleteExpense: async (userId: string, expenseId: string): Promise<any> => {
        const res = await api.delete(`/users/${userId}/expenses/${expenseId}`);
        console.log('res', res);
        return res
    },
};

export const incomeApi = {
    getIncome: async (userId: string, year: number, month: number): Promise<any[]> => {
        const response = await api.get(`/users/${userId}/income?year=${year}&month=${month}`);
        console.log('response income', response.data);
        return response.data;
    },
    createIncome: async (userId: string, data: {
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
    deleteIncome: async (userId: string, incomeId: string): Promise<any> => {
        const res = await api.delete(`/users/${userId}/income/${incomeId}`);
        return res
    },
};

export const categoryApi = {
    getCategories: async (type?: 'EXPENSE' | 'INCOME'): Promise<Category[]> => {
        let url = '/categories';
        if (type) url += `?type=${type}`;
        const response = await api.get(url);
        return response.data;
    },
    
    getUserTransactionsByCategory: async (
        categoryId: number, 
        userId: string, 
        type: 'INCOME' | 'EXPENSE', 
        year: number
    ): Promise<any> => {
        const url = `/categories/${categoryId}/transactions/${userId}?type=${type}&year=${year}`;
        console.log('📤 Making GET request to:', url);
        const response = await api.get(url);
        console.log('✅ getUserTransactionsByCategory SUCCESS:', response.data);
        return response.data;
    },
};

export const cashFlowApi = {
    getCashFlowByYear: async (userId: string, year: number, timezone?: string): Promise<CashFlowData> => {
        
        try {
            let url = `/users/${userId}/cash-flow/${year}`;
            if (timezone) {
                url += `?timezone=${encodeURIComponent(timezone)}`;
            }
            
            console.log('📤 Making GET request to:', url);
            const response = await api.get(url);
            console.log('✅ getCashFlowByYear SUCCESS:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ getCashFlowByYear ERROR:', error);
            console.error('❌ Full error details:', {
                message: error?.message,
                status: error?.response?.status,
                statusText: error?.response?.statusText,
                url: error?.config?.url,
                method: error?.config?.method,
                data: error?.response?.data,
            });
            throw error;
        }
    },

    getCashFlowYearSummary: async (userId: string, year: number): Promise<any> => {
        try {
            const url = `/users/${userId}/cash-flow/${year}/summary`;
            console.log('📤 Making GET request to:', url);
            const response = await api.get(url);
            console.log('✅ getCashFlowYearSummary SUCCESS:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ getCashFlowYearSummary ERROR:', error);
            console.error('❌ Full error details:', {
                message: error?.message,
                status: error?.response?.status,
                statusText: error?.response?.statusText,
                url: error?.config?.url,
                method: error?.config?.method,
                data: error?.response?.data,
            });
            throw error;
        }
    },

};

export const userAccountsApi = {
    create: async (data: {
        name: string;
        balance?: number;
        notes?: string;
    }): Promise<any> => {
        const response = await api.post('/user-accounts', data);
        console.log('Created account:', response.data);
        return response.data;
    },

    getAccounts: async (): Promise<any> => {
        const response = await api.get(`/user-accounts?limit=100`);
        return response.data;
    },

    update: async (id: string, data: {
        name?: string;
        balance?: number;
        notes?: string;
    }): Promise<any> => {
        const response = await api.patch(`/user-accounts/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<any> => {
        const res = await api.delete(`/user-accounts/${id}`);
        return res
    },
};