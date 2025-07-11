import { create } from 'zustand';
import { incomeApi, categoryApi } from '../services/api';
import { parseCostToNumber } from '../utils/costUtils';
import { formatDate, formatTime, formatISODate } from '../utils/dateUtils';

export interface Income {
    id: string;
    amount: number;
    description: string;
    category: string;
    categoryId: string;
    date: string;
    time: string;
}

export interface IncomeCategory {
    id: string;
    name: string;
    type: 'expense' | 'income';
    color: string;
    icon: string;
    userId: string;
}

interface MonthlyIncomeCache {
    [key: string]: {
        incomes: Income[];
        isLoading: boolean;
        lastLoaded: number;
    };
}

interface IncomeStore {
    // Cached incomes by month (key: "YYYY-MM")
    monthlyCache: MonthlyIncomeCache;
    
    // Shared categories (filtered for income type)
    categories: IncomeCategory[];
    isLoadingCategories: boolean;
    
    // Current month for IncomeScreen (always current date)
    currentMonth: number;
    currentYear: number;
    
    // Actions
    loadIncomesForMonth: (userId: string, year: number, month: number) => Promise<void>;
    loadCategories: (userId: string) => Promise<void>;
    addIncome: (userId: string, income: { category_id: number; amount: string; notes?: string; income_date?: string }) => Promise<Income>;
    updateIncome: (userId: string, incomeId: string, updates: { category_id?: number; amount?: string; notes?: string; income_date?: string }) => Promise<void>;
    deleteIncome: (userId: string, incomeId: string) => Promise<void>;
    updateCurrentDate: () => void;
    
    // Getters for specific months
    getIncomesForMonth: (year: number, month: number) => Income[];
    getCurrentMonthIncomes: () => Income[];
    getRecentIncomes: (limit?: number) => Income[];
    getTotalForMonth: (year: number, month: number) => number;
    getCurrentMonthTotal: () => number;
    getCategoryIcon: (categoryName: string) => string;
    isLoadingMonth: (year: number, month: number) => boolean;
    
    // Helper functions
    transformCategoryData: (data: any[], userId: string) => IncomeCategory[];
    getMonthKey: (year: number, month: number) => string;
}

export const useIncomeStore = create<IncomeStore>((set, get) => {
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

        transformCategoryData: (data: any[], userId: string): IncomeCategory[] => {
            return data.map((item: any) => {
                const category = item.category || item;
                return {
                    id: (item.id || item.category_id || category.id)?.toString() || '',
                    name: category.name || item.name || 'Unknown Category',
                    type: 'income' as const,
                    color: category.color || item.color || '#10b981',
                    icon: category.icon || item.icon || '💰',
                    userId: userId || ''
                };
            });
        },

        // Categories
        loadCategories: async (userId: string) => {
            if (!userId) return;
            
            set({ isLoadingCategories: true });
            
            try {
                // Use the shared category system with income type filtering
                const data = await categoryApi.getUserCategories(userId, 'INCOME');
                
                const categories = get().transformCategoryData(data, userId);
                
                set({ categories, isLoadingCategories: false });
            } catch (error) {
                console.error('Error loading income categories:', error);
                set({ isLoadingCategories: false });
                throw error;
            }
        },

        // Current date management
        updateCurrentDate: () => {
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            set({ currentMonth, currentYear });
        },

        // Month-specific loading
        loadIncomesForMonth: async (userId: string, year: number, month: number) => {
            if (!userId) return;
            
            const { monthlyCache, getMonthKey } = get();
            const monthKey = getMonthKey(year, month);
            
            // Check if already loading or recently loaded
            const cached = monthlyCache[monthKey];
            if (cached?.isLoading) return;
            
            // Set loading state
            set({
                monthlyCache: {
                    ...monthlyCache,
                    [monthKey]: {
                        incomes: cached?.incomes || [],
                        isLoading: true,
                        lastLoaded: cached?.lastLoaded || 0
                    }
                }
            });

            try {
                const data = await incomeApi.getIncome(userId, year, month);
                
                // Transform API data to match our Income interface
                const incomes: Income[] = data.map((item: any) => ({
                    id: item.id,
                    amount: typeof item.amount === 'string' ? parseCostToNumber(item.amount) : item.amount,
                    description: item.notes || item.description || '',
                    category: item.category?.name || item.category_name || 'Other',
                    categoryId: (item.category?.id || item.category_id)?.toString() || '',
                    date: formatISODate(item.income_date || item.date),
                    time: formatTime(item.created_at || item.income_date || item.date || new Date().toISOString())
                }));

                // Update cache
                set({
                    monthlyCache: {
                        ...get().monthlyCache,
                        [monthKey]: {
                            incomes,
                            isLoading: false,
                            lastLoaded: Date.now()
                        }
                    }
                });
            } catch (error) {
                console.error(`Error loading incomes for ${month}/${year}:`, error);
                
                // Set error state
                set({
                    monthlyCache: {
                        ...get().monthlyCache,
                        [monthKey]: {
                            incomes: cached?.incomes || [],
                            isLoading: false,
                            lastLoaded: cached?.lastLoaded || 0
                        }
                    }
                });
                throw error;
            }
        },

        // CRUD operations
        addIncome: async (userId: string, incomeData: { category_id: number; amount: string; notes?: string; income_date?: string }) => {
            if (!userId) throw new Error('User ID is required');
            
            try {
                const response = await incomeApi.addIncome(userId, incomeData);
                
                // Transform response to Income format
                const incomeDate = response.income_date || incomeData.income_date || new Date().toISOString();
                const incomeDateObj = new Date(incomeDate);
                
                const newIncome: Income = {
                    id: response.id,
                    amount: typeof response.amount === 'string' ? parseCostToNumber(response.amount) : response.amount,
                    description: response.notes || incomeData.notes || '',
                    category: response.category?.name || 'Other',
                    categoryId: (response.category?.id || response.category_id || incomeData.category_id)?.toString() || '',
                    date: formatISODate(incomeDateObj),
                    time: formatTime(response.created_at || incomeDate)
                };

                // Add to appropriate month cache using the original date
                const year = incomeDateObj.getFullYear();
                const month = incomeDateObj.getMonth() + 1;
                const monthKey = get().getMonthKey(year, month);
                
                const { monthlyCache } = get();
                const cached = monthlyCache[monthKey];
                
                if (cached) {
                    set({
                        monthlyCache: {
                            ...monthlyCache,
                            [monthKey]: {
                                ...cached,
                                incomes: [newIncome, ...cached.incomes]
                            }
                        }
                    });
                } else {
                    // If no cache exists for this month, create it
                    set({
                        monthlyCache: {
                            ...monthlyCache,
                            [monthKey]: {
                                incomes: [newIncome],
                                isLoading: false,
                                lastLoaded: Date.now()
                            }
                        }
                    });
                }
                
                return newIncome;
            } catch (error) {
                console.error('Error adding income:', error);
                throw error;
            }
        },

        updateIncome: async (userId: string, incomeId: string, updates: { category_id?: number; amount?: string; notes?: string; income_date?: string }) => {
            if (!userId) throw new Error('User ID is required');
            
            try {
                const response = await incomeApi.updateIncome(userId, incomeId, updates);
                
                // Transform response to Income format
                const updatedIncome: Income = {
                    id: response.id,
                    amount: typeof response.amount === 'string' ? parseCostToNumber(response.amount) : response.amount,
                    description: response.notes || updates.notes || '',
                    category: response.category?.name || 'Other',
                    categoryId: (response.category?.id || response.category_id || updates.category_id)?.toString() || '',
                    date: formatISODate(response.income_date || updates.income_date || new Date().toISOString()),
                    time: formatTime(response.created_at || response.income_date || new Date().toISOString())
                };

                // Update in all relevant month caches
                const { monthlyCache } = get();
                const updatedCache = { ...monthlyCache };
                
                Object.keys(updatedCache).forEach(monthKey => {
                    const cached = updatedCache[monthKey];
                    const incomeIndex = cached.incomes.findIndex(income => income.id === incomeId);
                    
                    if (incomeIndex !== -1) {
                        updatedCache[monthKey] = {
                            ...cached,
                            incomes: [
                                ...cached.incomes.slice(0, incomeIndex),
                                updatedIncome,
                                ...cached.incomes.slice(incomeIndex + 1)
                            ]
                        };
                    }
                });
                
                set({ monthlyCache: updatedCache });
            } catch (error) {
                console.error('Error updating income:', error);
                throw error;
            }
        },

        deleteIncome: async (userId: string, incomeId: string) => {
            if (!userId) throw new Error('User ID is required');
            
            try {
                await incomeApi.deleteIncome(userId, incomeId);
                
                // Remove from all month caches
                const { monthlyCache } = get();
                const updatedCache = { ...monthlyCache };
                
                Object.keys(updatedCache).forEach(monthKey => {
                    const cached = updatedCache[monthKey];
                    updatedCache[monthKey] = {
                        ...cached,
                        incomes: cached.incomes.filter(income => income.id !== incomeId)
                    };
                });
                
                set({ monthlyCache: updatedCache });
            } catch (error) {
                console.error('Error deleting income:', error);
                throw error;
            }
        },

        // Getters
        getIncomesForMonth: (year: number, month: number) => {
            const { monthlyCache, getMonthKey } = get();
            const monthKey = getMonthKey(year, month);
            return monthlyCache[monthKey]?.incomes || [];
        },

        getCurrentMonthIncomes: () => {
            const { currentYear, currentMonth, getIncomesForMonth } = get();
            return getIncomesForMonth(currentYear, currentMonth);
        },

        getRecentIncomes: (limit: number = 10) => {
            const { getCurrentMonthIncomes } = get();
            const incomes = getCurrentMonthIncomes();
            
            // Sort by date (newest first) and take the limit
            return incomes
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, limit);
        },

        getTotalForMonth: (year: number, month: number) => {
            const { getIncomesForMonth } = get();
            const incomes = getIncomesForMonth(year, month);
            return incomes.reduce((total, income) => total + income.amount, 0);
        },

        getCurrentMonthTotal: () => {
            const { currentYear, currentMonth, getTotalForMonth } = get();
            return getTotalForMonth(currentYear, currentMonth);
        },

        isLoadingMonth: (year: number, month: number) => {
            const { monthlyCache, getMonthKey } = get();
            const monthKey = getMonthKey(year, month);
            return monthlyCache[monthKey]?.isLoading || false;
        },

        getCategoryIcon: (categoryName: string) => {
            switch (categoryName.toLowerCase()) {
                case 'salary': return '💼';
                case 'freelance': return '💻';
                case 'investment': case 'investments': return '📈';
                case 'business': return '🏢';
                case 'bonus': return '🎁';
                case 'rewards': case 'reward': return '🏆';
                case 'rental': return '🏠';
                case 'dividend': case 'dividends': return '💎';
                case 'gift': return '🎁';
                case 'refund': return '💸';
                default: return '💰';
            }
        },
    };
});
