import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { userAccountsApi, UserAccountQueryParams } from '../services/userAccountsService';
import type { UserAccount, CreateUserAccountRequest, UpdateUserAccountRequest } from '@/types';

export const useUserAccounts = () => {
  console.log('🔄 useUserAccounts hook initialized');
  
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  console.log('📋 useUserAccounts state:', {
    accountsCount: accounts.length,
    loading,
    refreshing,
    totalBalance,
    hasError: !!error,
    error: error?.substring(0, 100) // Truncate long errors
  });
  
  // Use ref to store the fetch function to prevent re-renders
  const fetchAccountsRef = useRef<(params?: UserAccountQueryParams, isRefresh?: boolean) => Promise<void>>();

  // Fetch accounts with optional query parameters
  const fetchAccounts = useCallback(async (params?: UserAccountQueryParams, isRefresh = false) => {
    const requestId = Math.random().toString(36).substr(2, 9);
    console.log(`🌐 [${requestId}] fetchAccounts called:`, {
      params,
      isRefresh,
      currentState: { loading, refreshing, accountsCount: accounts.length }
    });
    
    try {
      if (isRefresh) {
        console.log(`🔄 [${requestId}] Setting refreshing to true`);
        setRefreshing(true);
      } else {
        console.log(`⏳ [${requestId}] Setting loading to true`);
        setLoading(true);
      }
      setError(null);

      console.log(`📡 [${requestId}] Making API call to userAccountsApi.getAll...`);
      const response = await userAccountsApi.getAll(params);
      console.log(`✅ [${requestId}] API call successful:`, {
        dataLength: response.data?.length,
        meta: response.meta,
        firstAccount: response.data?.[0] ? {
          id: response.data[0].id,
          name: response.data[0].name,
          balance: response.data[0].balance
        } : null
      });
      
      setAccounts(response.data);
      
      // Calculate total balance from accounts (balance is string from backend)
      const total = response.data.reduce((sum, account) => {
        const balance = parseFloat(account.balance) || 0;
        return sum + balance;
      }, 0);
      console.log(`💰 [${requestId}] Calculated total balance:`, total);
      setTotalBalance(total);
    } catch (err: any) {
      console.error(`❌ [${requestId}] Error fetching accounts:`, {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        url: err?.config?.url,
        method: err?.config?.method,
        headers: err?.config?.headers
      });
      
      // Handle authentication errors specifically
      if (err?.response?.status === 401) {
        console.log(`🔒 [${requestId}] Authentication error - user will be logged out by interceptor`);
        setError('Authentication required. Please log in again.');
      } else {
        const errorMessage = err?.response?.data?.message || 'Failed to fetch accounts';
        console.log(`🚨 [${requestId}] Setting error:`, errorMessage);
        setError(errorMessage);
      }
    } finally {
      console.log(`🏁 [${requestId}] fetchAccounts finished, setting loading states to false`);
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  // Store the function in ref
  fetchAccountsRef.current = fetchAccounts;

  // Create a new account
  const createAccount = useCallback(async (data: CreateUserAccountRequest): Promise<boolean> => {
    try {
      setError(null);
      console.log('Creating account with data:', data);
      const newAccount = await userAccountsApi.create(data);
      console.log('Account created successfully:', newAccount);
      
      // Refresh accounts instead of manually updating state
      fetchAccountsRef.current?.();
      
      return true;
    } catch (err: any) {
      console.error('Error creating account:', err);
      console.error('Error response data:', err?.response?.data);
      console.error('Error response status:', err?.response?.status);
      const errorMessage = err?.response?.data?.message || 'Failed to create account';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, []);

  // Update an existing account
  const updateAccount = useCallback(async (id: string, data: UpdateUserAccountRequest): Promise<boolean> => {
    try {
      setError(null);
      await userAccountsApi.update(id, data);
      
      // Refresh accounts instead of manually updating state
      fetchAccountsRef.current?.();
      
      return true;
    } catch (err: any) {
      console.error('Error updating account:', err);
      const errorMessage = err?.response?.data?.message || 'Failed to update account';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, []);

  // Delete an account
  const deleteAccount = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await userAccountsApi.delete(id);
      
      // Refresh accounts instead of manually updating state
      fetchAccountsRef.current?.();
      
      return true;
    } catch (err: any) {
      console.error('Error deleting account:', err);
      const errorMessage = err?.response?.data?.message || 'Failed to delete account';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, []);

  // Add amount to account balance
  const addToBalance = useCallback(async (id: string, amount: number): Promise<boolean> => {
    try {
      setError(null);
      await userAccountsApi.addToBalance(id, amount);
      
      // Refresh accounts instead of manually updating state
      fetchAccountsRef.current?.();
      
      return true;
    } catch (err: any) {
      console.error('Error adding to balance:', err);
      const errorMessage = err?.response?.data?.message || 'Failed to add to balance';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, []);

  // Subtract amount from account balance
  const subtractFromBalance = useCallback(async (id: string, amount: number): Promise<boolean> => {
    try {
      setError(null);
      await userAccountsApi.subtractFromBalance(id, amount);
      
      // Refresh accounts instead of manually updating state
      fetchAccountsRef.current?.();
      
      return true;
    } catch (err: any) {
      console.error('Error subtracting from balance:', err);
      const errorMessage = err?.response?.data?.message || 'Failed to subtract from balance';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, []);

  // Refresh accounts (pull to refresh)
  const refreshAccounts = useCallback(() => {
    console.log('🔄 refreshAccounts called - triggering refresh');
    fetchAccountsRef.current?.(undefined, true);
  }, []);

  // Initial data fetch
  useEffect(() => {
    console.log('🚀 useUserAccounts useEffect triggered - calling fetchAccounts for initial load');
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    loading,
    refreshing,
    totalBalance,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    addToBalance,
    subtractFromBalance,
    refreshAccounts,
  };
};
