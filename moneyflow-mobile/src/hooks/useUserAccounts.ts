import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { userAccountsApi, UserAccountQueryParams } from '../services/userAccountsService';
import type { UserAccount, CreateUserAccountRequest, UpdateUserAccountRequest } from '@/types';

export const useUserAccounts = () => {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch accounts with optional query parameters
  const fetchAccounts = useCallback(async (params?: UserAccountQueryParams, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await userAccountsApi.getAll(params);
      setAccounts(response.data);
      
      // Calculate total balance from accounts (balance is string from backend)
      const total = response.data.reduce((sum, account) => {
        const balance = parseFloat(account.balance) || 0;
        return sum + balance;
      }, 0);
      setTotalBalance(total);
    } catch (err: any) {
      console.error('Error fetching accounts:', err);
      setError(err?.response?.data?.message || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Create a new account
  const createAccount = useCallback(async (data: CreateUserAccountRequest): Promise<boolean> => {
    try {
      setError(null);
      console.log('Creating account with data:', data);
      const newAccount = await userAccountsApi.create(data);
      console.log('Account created successfully:', newAccount);
      setAccounts(prev => [newAccount, ...prev]);
      
      // Parse balance as it's a string from backend
      const balanceNum = parseFloat(newAccount.balance) || 0;
      setTotalBalance(prev => prev + balanceNum);
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
      const updatedAccount = await userAccountsApi.update(id, data);
      
      setAccounts(prev => prev.map(account => 
        account.id === id ? updatedAccount : account
      ));
      
      // Recalculate total balance - parse strings to numbers
      const newTotal = accounts.reduce((sum, account) => {
        const balance = account.id === id 
          ? parseFloat(updatedAccount.balance) || 0
          : parseFloat(account.balance) || 0;
        return sum + balance;
      }, 0);
      setTotalBalance(newTotal);
      
      return true;
    } catch (err: any) {
      console.error('Error updating account:', err);
      const errorMessage = err?.response?.data?.message || 'Failed to update account';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, [accounts]);

  // Delete an account
  const deleteAccount = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await userAccountsApi.delete(id);
      
      const accountToDelete = accounts.find(account => account.id === id);
      if (accountToDelete) {
        const balanceNum = parseFloat(accountToDelete.balance) || 0;
        setTotalBalance(prev => prev - balanceNum);
      }
      
      setAccounts(prev => prev.filter(account => account.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting account:', err);
      const errorMessage = err?.response?.data?.message || 'Failed to delete account';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, [accounts]);

  // Add amount to account balance
  const addToBalance = useCallback(async (id: string, amount: number): Promise<boolean> => {
    try {
      setError(null);
      const updatedAccount = await userAccountsApi.addToBalance(id, amount);
      
      setAccounts(prev => prev.map(account => 
        account.id === id ? updatedAccount : account
      ));
      setTotalBalance(prev => prev + amount);
      
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
      const updatedAccount = await userAccountsApi.subtractFromBalance(id, amount);
      
      setAccounts(prev => prev.map(account => 
        account.id === id ? updatedAccount : account
      ));
      setTotalBalance(prev => prev - amount);
      
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
    fetchAccounts(undefined, true);
  }, [fetchAccounts]);

  // Initial data fetch
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    loading,
    refreshing,
    totalBalance,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    addToBalance,
    subtractFromBalance,
    refreshAccounts,
  };
};
