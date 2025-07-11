import api from './api';
import { getCurrentISODate, createDateInTimezone } from '../utils/dateUtils';

export interface IncomeData {
    id: string;
    amount: number;
    description: string;
    category: string;
    income_date: string;
    time?: string;
    categoryId?: string;
}

export interface CreateIncomeRequest {
    amount: number;
    description: string;
    categoryId: string;
    income_date: string;
}

export interface UpdateIncomeRequest {
    amount?: number;
    description?: string;
    categoryId?: string;
    income_date?: string;
}

export const incomeService = {
    // Create a new income entry
    createIncome: async (
        userId: string,
        incomeData: Omit<CreateIncomeRequest, 'income_date'> & { income_date?: string }
    ): Promise<IncomeData> => {
        try {
            const payload: CreateIncomeRequest = {
                ...incomeData,
                income_date: incomeData.income_date || getCurrentISODate()
            };

            const response = await api.post(`/users/${userId}/income`, payload);
            return response.data;
        } catch (error) {
            console.error('Error creating income:', error);
            throw error;
        }
    },

    // Get all income entries for a user
    getIncomes: async (
        userId: string,
        year?: number,
        month?: number
    ): Promise<IncomeData[]> => {
        try {
            let url = `/users/${userId}/income`;
            const params = new URLSearchParams();
            
            if (year !== undefined) {
                params.append('year', year.toString());
            }
            if (month !== undefined) {
                params.append('month', (month + 1).toString()); // Convert 0-based to 1-based
            }
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching incomes:', error);
            throw error;
        }
    },

    // Update an income entry
    updateIncome: async (
        userId: string,
        incomeId: string,
        updateData: UpdateIncomeRequest
    ): Promise<IncomeData> => {
        try {
            const response = await api.patch(`/users/${userId}/income/${incomeId}`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating income:', error);
            throw error;
        }
    },

    // Delete an income entry
    deleteIncome: async (userId: string, incomeId: string): Promise<void> => {
        try {
            await api.delete(`/users/${userId}/income/${incomeId}`);
        } catch (error) {
            console.error('Error deleting income:', error);
            throw error;
        }
    },

    // Get income summary for a user
    getIncomeSummary: async (
        userId: string,
        year?: number,
        month?: number
    ): Promise<{ total: number; count: number }> => {
        try {
            let url = `/users/${userId}/income/summary`;
            const params = new URLSearchParams();
            
            if (year !== undefined) {
                params.append('year', year.toString());
            }
            if (month !== undefined) {
                params.append('month', (month + 1).toString()); // Convert 0-based to 1-based
            }
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching income summary:', error);
            throw error;
        }
    }
};
