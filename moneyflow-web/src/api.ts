import axios from 'axios';
import type { Category, User } from './types';
import { AUTH_KEY } from './config';
import type { CashFlowData } from './global.store';

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
            const token = localStorage.getItem(AUTH_KEY);
            
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
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
        
        // 401 = immediate logout (industry standard)
        if (error.response?.status === 401) {
            console.log('🔒 401 Unauthorized - Logging out user');
            
            // Clear token
            localStorage.removeItem(AUTH_KEY);
            
            // TODO: Implement logout logic, e.g., redirect to login page
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
        const { accessToken, user } = response.data;
        return { user, accessToken };
    },
}


export const expenseApi = {
    getExpenses: async (userId: string, year: number, month: number): Promise<any[]> => {
        const response = await api.get(`/users/${userId}/expenses?year=${year}&month=${month}`);
        return response.data;
    },
};

export const incomeApi = {
    getIncome: async (userId: string, year: number, month: number): Promise<any[]> => {
        const response = await api.get(`/users/${userId}/income?year=${year}&month=${month}`);
        return response.data;
    },
};

export const categoryApi = {
    getCategories: async (type?: 'EXPENSE' | 'INCOME'): Promise<Category[]> => {
        let url = '/categories';
        if (type) url += `?type=${type}`;
        const response = await api.get(url);
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