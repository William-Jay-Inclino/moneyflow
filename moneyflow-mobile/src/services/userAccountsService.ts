import api from './api';
import type { 
  UserAccount, 
  CreateUserAccountRequest, 
  UpdateUserAccountRequest, 
  UserAccountsResponse 
} from '@/types';

export interface UserAccountQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const userAccountsApi = {
  // Get all user accounts with optional query parameters
  getAll: async (params?: UserAccountQueryParams): Promise<UserAccountsResponse> => {
    console.log('🌐 userAccountsApi.getAll called with params:', params);
    
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const url = queryString ? `/user-accounts?${queryString}` : '/user-accounts';
    
    console.log('📡 Making API request to:', url);
    console.log('🔑 Request will include auth headers via interceptor');
    
    try {
      const response = await api.get(url);
      console.log('✅ userAccountsApi.getAll success:', {
        status: response.status,
        dataLength: response.data?.data?.length,
        meta: response.data?.meta
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ userAccountsApi.getAll error:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
        url: error?.config?.url
      });
      throw error;
    }
  },

  // Get a specific user account by ID
  getById: async (id: string): Promise<UserAccount> => {
    const response = await api.get(`/user-accounts/${id}`);
    return response.data;
  },

  // Create a new user account
  create: async (data: CreateUserAccountRequest): Promise<UserAccount> => {
    const response = await api.post('/user-accounts', data);
    return response.data;
  },

  // Update an existing user account
  update: async (id: string, data: UpdateUserAccountRequest): Promise<UserAccount> => {
    const response = await api.patch(`/user-accounts/${id}`, data);
    return response.data;
  },

  // Delete a user account
  delete: async (id: string): Promise<void> => {
    await api.delete(`/user-accounts/${id}`);
  },

  // Get total balance across all accounts
  getTotalBalance: async (): Promise<{ balance: number }> => {
    const response = await api.get('/user-accounts/total');
    return response.data;
  },

  // Add amount to account balance
  addToBalance: async (id: string, amount: number): Promise<UserAccount> => {
    const response = await api.patch(`/user-accounts/${id}/balance/add`, { amount });
    return response.data;
  },

  // Subtract amount from account balance
  subtractFromBalance: async (id: string, amount: number): Promise<UserAccount> => {
    const response = await api.patch(`/user-accounts/${id}/balance/subtract`, { amount });
    return response.data;
  },
};
