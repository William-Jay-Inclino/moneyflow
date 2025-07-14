import { create } from 'zustand';
import { transactionApi, categoryApi } from '../services/api';
import { parseCostToNumber } from '../utils/costUtils';
import { formatDate, formatTime, formatISODate } from '../utils/dateUtils';
import { useCashFlowStore } from './cashFlowStore';

export interface Expense {
    id: string;
    amount: number;
    description: string;
    category: string;
    categoryId: string;
    date: string;
    time: string;
}

export interface Category {
    id: string;
    name: string;
    type: 'expense' | 'income';
    color: string;
    icon: string;
    userId: string;
}

interface MonthlyExpenseCache {
    [key: string]: {
        expenses: Expense[];
        isLoading: boolean;
        lastLoaded: number;
    };
}

interface ExpenseStore {
    // Cached expenses by month (key: "YYYY-MM")
    monthlyCache: MonthlyExpenseCache;
    
    // Shared categories
    categories: Category[];
    isLoadingCategories: boolean;
    
    // Current month for ExpenseScreen (always current date)
    currentMonth: number;
    currentYear: number;
    
    // Actions
    loadExpensesForMonth: (userId: string, year: number, month: number) => Promise<void>;
    loadCategories: (userId: string) => Promise<void>;
    addExpense: (userId: string, expense: { category_id: number; cost: string; notes?: string; expense_date?: string }) => Promise<Expense>;
    updateExpense: (userId: string, expenseId: string, updates: { category_id?: number; cost?: string; notes?: string; expense_date?: string }) => Promise<void>;
    deleteExpense: (userId: string, expenseId: string) => Promise<void>;
    updateCurrentDate: () => void;
    
    // Getters for specific months
    getExpensesForMonth: (year: number, month: number) => Expense[];
    getCurrentMonthExpenses: () => Expense[];
    getRecentExpenses: (limit?: number) => Expense[];
    getTotalForMonth: (year: number, month: number) => number;
    getCurrentMonthTotal: () => number;
    getCategoryIcon: (categoryName: string) => string;
    isLoadingMonth: (year: number, month: number) => boolean;
    
    // Helper functions
    transformCategoryData: (data: any[], userId: string) => Category[];
    getMonthKey: (year: number, month: number) => string;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => {
    // Initialize with current month/year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return {
        // Initial state
        monthlyCache: {},
        categories: [],
        isLoadingCategories: false,
        currentMonth,
        currentYear,

        // Helper functions
        getMonthKey: (year: number, month: number) => `${year}-${month.toString().padStart(2, '0')}`,

        transformCategoryData: (data: any[], userId: string): Category[] => {
            return data.map((item: any) => {
                const category = item.category || item;
                return {
                    id: (item.id || item.category_id || category.id)?.toString() || '',
                    name: category.name || item.name || 'Unknown Category',
                    type: 'expense' as const,
                    color: category.color || item.color || '#3b82f6',
                    icon: category.icon || item.icon || '💳',
                    userId: userId || ''
                };
            });
        },

        // Categories
        loadCategories: async (_userId: string) => {
            try {
                set({ isLoadingCategories: true });
                // Use global category API
                const response: any = await categoryApi.getAllCategories('EXPENSE');
                const categoryData = Array.isArray(response) ? response : response?.data || [];
                const transformedCategories = get().transformCategoryData(categoryData, '');
                set({ categories: transformedCategories });
            } catch (error) {
                console.error('Error loading categories:', error);
                set({ categories: [] });
            } finally {
                set({ isLoadingCategories: false });
            }
        },

        // Load expenses for specific month
        loadExpensesForMonth: async (userId: string, year: number, month: number) => {
            if (!userId) return;
            
            const monthKey = get().getMonthKey(year, month);
            
            try {
                // Set loading state for this month
                set(state => ({
                    monthlyCache: {
                        ...state.monthlyCache,
                        [monthKey]: {
                            expenses: state.monthlyCache[monthKey]?.expenses || [],
                            isLoading: true,
                            lastLoaded: Date.now()
                        }
                    }
                }));

                const data = await transactionApi.getExpenses(userId, year, month);
                const formattedExpenses = data.map((expense: any) => ({
                    id: expense.id,
                    amount: parseCostToNumber(expense.cost),
                    description: expense.notes || 'No description',
                    category: expense.category?.category?.name || 'Other',
                    categoryId: (expense.category?.category?.id || expense.category?.category_id || expense.category_id)?.toString() || '',
                    date: formatISODate(new Date(expense.expense_date || expense.created_at)),
                    time: formatTime(expense.created_at)
                }));
                
                // Sort by expense date (newest first)
                const sortedExpenses = formattedExpenses.sort((a, b) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );

                // Update cache for this month
                set(state => ({
                    monthlyCache: {
                        ...state.monthlyCache,
                        [monthKey]: {
                            expenses: sortedExpenses,
                            isLoading: false,
                            lastLoaded: Date.now()
                        }
                    }
                }));
            } catch (error) {
                console.error('Error loading expenses:', error);
                // Set error state
                set(state => ({
                    monthlyCache: {
                        ...state.monthlyCache,
                        [monthKey]: {
                            expenses: [],
                            isLoading: false,
                            lastLoaded: Date.now()
                        }
                    }
                }));
            }
        },

        // Add expense
        addExpense: async (userId: string, expense: { category_id: number; cost: string; notes?: string; expense_date?: string }) => {
            const newExpense = await transactionApi.createExpense(userId, expense);
            
            const formattedExpense: Expense = {
                id: newExpense.id,
                amount: parseCostToNumber(newExpense.cost),
                description: newExpense.notes || 'No description',
                category: 'Unknown', // Will be updated by categories lookup
                categoryId: expense.category_id.toString(),
                date: formatISODate(new Date(newExpense.expense_date || newExpense.created_at)),
                time: formatTime(newExpense.created_at)
            };

            // Find category name
            const categoryObj = get().categories.find(cat => cat.id === expense.category_id.toString());
            if (categoryObj) {
                formattedExpense.category = categoryObj.name;
            }

            // Add to relevant month cache - use expense_date for proper month allocation
            const expenseDate = new Date(newExpense.expense_date || newExpense.created_at);
            const expenseYear = expenseDate.getFullYear();
            const expenseMonth = expenseDate.getMonth() + 1;
            const monthKey = get().getMonthKey(expenseYear, expenseMonth);

            set(state => ({
                monthlyCache: {
                    ...state.monthlyCache,
                    [monthKey]: {
                        expenses: [formattedExpense, ...(state.monthlyCache[monthKey]?.expenses || [])],
                        isLoading: false,
                        lastLoaded: Date.now()
                    }
                }
            }));

            // Notify cash flow store to refresh the affected year
            try {
                useCashFlowStore.getState().notifyAmountChange(userId, expenseYear);
            } catch (error) {
                console.warn('Failed to refresh cash flow for year', expenseYear, error);
            }

            return formattedExpense;
        },

        // Update expense
        updateExpense: async (userId: string, expenseId: string, updates: { category_id?: number; cost?: string; notes?: string; expense_date?: string }) => {
            const updatedExpense = await transactionApi.updateExpense(userId, expenseId, updates);
            
            // Find category name if category_id is provided
            let categoryName = 'Unknown';
            if (updates.category_id) {
                const categoryObj = get().categories.find(cat => cat.id === updates.category_id!.toString());
                if (categoryObj) {
                    categoryName = categoryObj.name;
                }
            }

            // Create the updated expense object with all changes
            const updatedDate = updates.expense_date ? formatISODate(new Date(updates.expense_date)) : null;
            const updatedTime = updatedExpense.created_at ? formatTime(updatedExpense.created_at) : null;

            // Update in all relevant month caches
            set(state => {
                const newCache = { ...state.monthlyCache };
                
                // Find the expense across all months
                for (const monthKey of Object.keys(newCache)) {
                    const monthData = newCache[monthKey];
                    const expenseIndex = monthData.expenses.findIndex(exp => exp.id === expenseId);
                    
                    if (expenseIndex !== -1) {
                        const currentExpense = monthData.expenses[expenseIndex];
                        
                        // Create updated expense object
                        const updatedExpenseObj: Expense = {
                            id: currentExpense.id,
                            amount: updates.cost ? parseCostToNumber(updates.cost) : currentExpense.amount,
                            description: updates.notes !== undefined ? updates.notes : currentExpense.description,
                            category: updates.category_id ? categoryName : currentExpense.category,
                            categoryId: updates.category_id ? updates.category_id.toString() : currentExpense.categoryId,
                            date: updatedDate || currentExpense.date,
                            time: updatedTime || currentExpense.time
                        };

                        // Remove from current location
                        const updatedExpenses = [...monthData.expenses];
                        updatedExpenses.splice(expenseIndex, 1);
                        
                        newCache[monthKey] = {
                            ...monthData,
                            expenses: updatedExpenses
                        };

                        // Determine the correct month for the updated expense
                        let targetMonthKey: string;
                        if (updates.expense_date) {
                            const expenseDate = new Date(updates.expense_date);
                            const expenseYear = expenseDate.getFullYear();
                            const expenseMonth = expenseDate.getMonth() + 1;
                            targetMonthKey = get().getMonthKey(expenseYear, expenseMonth);
                        } else {
                            // Keep in the same month if date wasn't changed
                            targetMonthKey = monthKey;
                        }

                        // Add to the target month (create cache entry if it doesn't exist)
                        if (!newCache[targetMonthKey]) {
                            newCache[targetMonthKey] = {
                                expenses: [],
                                isLoading: false,
                                lastLoaded: Date.now()
                            };
                        }

                        newCache[targetMonthKey] = {
                            ...newCache[targetMonthKey],
                            expenses: [updatedExpenseObj, ...newCache[targetMonthKey].expenses]
                        };

                        // Sort the expenses by date (newest first) in the target month
                        newCache[targetMonthKey].expenses.sort((a, b) => 
                            new Date(b.date).getTime() - new Date(a.date).getTime()
                        );
                        
                        break; // Exit the loop once we've found and updated the expense
                    }
                }

                return { monthlyCache: newCache };
            });
            
            // Notify cash flow store to refresh the affected year(s)
            try {
                const currentYear = new Date().getFullYear();
                const targetYear = updates.expense_date ? new Date(updates.expense_date).getFullYear() : currentYear;
                useCashFlowStore.getState().notifyAmountChange(userId, targetYear);
            } catch (error) {
                console.warn('Failed to refresh cash flow after expense update', error);
            }
        },

        // Delete expense
        deleteExpense: async (userId: string, expenseId: string) => {
            // Find the expense to get the year before deletion
            const { monthlyCache } = get();
            let expenseYear: number | null = null;
            
            for (const monthKey of Object.keys(monthlyCache)) {
                const expense = monthlyCache[monthKey].expenses.find(exp => exp.id === expenseId);
                if (expense) {
                    expenseYear = new Date(expense.date).getFullYear();
                    break;
                }
            }
            
            await transactionApi.deleteExpense(userId, expenseId);
            
            // Remove from all month caches
            set(state => {
                const newCache = { ...state.monthlyCache };
                
                Object.keys(newCache).forEach(monthKey => {
                    const monthData = newCache[monthKey];
                    newCache[monthKey] = {
                        ...monthData,
                        expenses: monthData.expenses.filter(expense => expense.id !== expenseId)
                    };
                });

                return { monthlyCache: newCache };
            });
            
            // Notify cash flow store to refresh the affected year
            if (expenseYear) {
                try {
                    useCashFlowStore.getState().notifyAmountChange(userId, expenseYear);
                } catch (error) {
                    console.warn('Failed to refresh cash flow after expense deletion', error);
                }
            }
        },

        // Getters
        getExpensesForMonth: (year: number, month: number) => {
            const monthKey = get().getMonthKey(year, month);
            return get().monthlyCache[monthKey]?.expenses || [];
        },

        getCurrentMonthExpenses: () => {
            const { currentYear, currentMonth } = get();
            return get().getExpensesForMonth(currentYear, currentMonth);
        },

        getRecentExpenses: (limit: number = 10) => {
            const currentExpenses = get().getCurrentMonthExpenses();
            return currentExpenses.slice(0, limit);
        },

        getTotalForMonth: (year: number, month: number) => {
            const expenses = get().getExpensesForMonth(year, month);
            return expenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
        },

        getCurrentMonthTotal: () => {
            const { currentYear, currentMonth } = get();
            return get().getTotalForMonth(currentYear, currentMonth);
        },

        isLoadingMonth: (year: number, month: number) => {
            const monthKey = get().getMonthKey(year, month);
            return get().monthlyCache[monthKey]?.isLoading || false;
        },

        getCategoryIcon: (categoryName: string) => {
            const category = get().categories.find(cat => cat.name === categoryName);
            return category?.icon || '💳';
        },

        updateCurrentDate: () => {
            const now = new Date();
            const newMonth = now.getMonth() + 1;
            const newYear = now.getFullYear();
            
            const { currentMonth, currentYear } = get();
            if (newMonth !== currentMonth || newYear !== currentYear) {
                set({ currentMonth: newMonth, currentYear: newYear });
            }
        }
    };
});
