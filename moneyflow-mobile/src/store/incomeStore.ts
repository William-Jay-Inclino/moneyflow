import { create } from 'zustand';
import { incomeApi, categoryApi } from '../services/api';
import { parseCostToNumber } from '../utils/costUtils';
import { formatTime, formatISODate } from '../utils/dateUtils';
import { useCashFlowStore } from './cashFlowStore';

export interface Income {
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
    type: 'income' | 'expense';
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
    monthlyCache: MonthlyIncomeCache;
    categories: Category[];
    isLoadingCategories: boolean;
    currentMonth: number;
    currentYear: number;
    loadIncomesForMonth: (userId: string, year: number, month: number) => Promise<void>;
    loadCategories: (userId: string) => Promise<void>;
    addIncome: (userId: string, income: { category_id: number; amount: string; notes?: string; income_date?: string }) => Promise<Income>;
    updateIncome: (userId: string, incomeId: string, updates: { category_id?: number; amount?: string; notes?: string; income_date?: string }) => Promise<void>;
    deleteIncome: (userId: string, incomeId: string) => Promise<void>;
    updateCurrentDate: () => void;
    getIncomesForMonth: (year: number, month: number) => Income[];
    getCurrentMonthIncomes: () => Income[];
    getRecentIncomes: (limit?: number) => Income[];
    getTotalForMonth: (year: number, month: number) => number;
    getCurrentMonthTotal: () => number;
    getCategoryIcon: (categoryId: string) => string;
    isLoadingMonth: (year: number, month: number) => boolean;
    transformCategoryData: (data: any[], userId: string) => Category[];
    getMonthKey: (year: number, month: number) => string;
}

export const useIncomeStore = create<IncomeStore>((set, get) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return {
        monthlyCache: {},
        categories: [],
        isLoadingCategories: false,
        currentMonth,
        currentYear,

        getMonthKey: (year: number, month: number) => `${year}-${month.toString().padStart(2, '0')}`,

        transformCategoryData: (data: any[], userId: string): Category[] => {
            return data.map((item: any) => {
                const category = item.category || item;
                return {
                    id: (item.id || item.category_id || category.id)?.toString() || '',
                    name: category.name || item.name || 'Unknown Category',
                    type: 'income' as const,
                    color: category.color || item.color || '#22c55e',
                    icon: category.icon || item.icon || '💰',
                    userId: userId || ''
                };
            });
        },

        loadCategories: async (_userId: string) => {
            try {
                set({ isLoadingCategories: true });
                let categoryData: any[] = [];
                const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
                const stored = await AsyncStorage.getItem('global_income_categories');
                if (stored) {
                    categoryData = JSON.parse(stored);
                }
                if (!categoryData.length) {
                    const response: any = await categoryApi.getAllCategories('INCOME');
                    categoryData = Array.isArray(response) ? response : response?.data || [];
                    await AsyncStorage.setItem('global_income_categories', JSON.stringify(categoryData));
                }
                const transformedCategories = get().transformCategoryData(categoryData, '');
                set({ categories: transformedCategories });
            } catch (error) {
                console.error('Error loading categories:', error);
                set({ categories: [] });
            } finally {
                set({ isLoadingCategories: false });
            }
        },

        loadIncomesForMonth: async (userId: string, year: number, month: number) => {
            if (!userId) return;
            const monthKey = get().getMonthKey(year, month);
            try {
                set(state => ({
                    monthlyCache: {
                        ...state.monthlyCache,
                        [monthKey]: {
                            incomes: state.monthlyCache[monthKey]?.incomes || [],
                            isLoading: true,
                            lastLoaded: Date.now()
                        }
                    }
                }));
                const data = await incomeApi.getIncome(userId, year, month);
                const formattedIncomes = data.map((income: any) => ({
                    id: income.id,
                    amount: parseCostToNumber(income.amount),
                    description: income.notes || 'No description',
                    category: income.category?.category?.name || 'Other',
                    categoryId: (income.category?.category?.id || income.category?.category_id || income.category_id)?.toString() || '',
                    date: formatISODate(new Date(income.income_date || income.created_at)),
                    time: formatTime(income.created_at)
                }));
                const sortedIncomes = formattedIncomes.sort((a: Income, b: Income) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                set(state => ({
                    monthlyCache: {
                        ...state.monthlyCache,
                        [monthKey]: {
                            incomes: sortedIncomes,
                            isLoading: false,
                            lastLoaded: Date.now()
                        }
                    }
                }));
            } catch (error) {
                console.error('Error loading incomes:', error);
                set(state => ({
                    monthlyCache: {
                        ...state.monthlyCache,
                        [monthKey]: {
                            incomes: [],
                            isLoading: false,
                            lastLoaded: Date.now()
                        }
                    }
                }));
            }
        },

        addIncome: async (userId: string, income: { category_id: number; amount: string; notes?: string; income_date?: string }) => {
            const newIncome = await incomeApi.createIncome(userId, income);
            const formattedIncome: Income = {
                id: newIncome.id,
                amount: parseCostToNumber(newIncome.amount),
                description: newIncome.notes || 'No description',
                category: 'Unknown',
                categoryId: income.category_id.toString(),
                date: formatISODate(new Date(newIncome.income_date || newIncome.created_at)),
                time: formatTime(newIncome.created_at)
            };
            const categoryObj = get().categories.find(cat => cat.id === income.category_id.toString());
            if (categoryObj) {
                formattedIncome.category = categoryObj.name;
            }
            const incomeDate = new Date(newIncome.income_date || newIncome.created_at);
            const incomeYear = incomeDate.getFullYear();
            const incomeMonth = incomeDate.getMonth() + 1;
            const monthKey = get().getMonthKey(incomeYear, incomeMonth);
            set(state => ({
                monthlyCache: {
                    ...state.monthlyCache,
                    [monthKey]: {
                        incomes: [formattedIncome, ...(state.monthlyCache[monthKey]?.incomes || [])],
                        isLoading: false,
                        lastLoaded: Date.now()
                    }
                }
            }));
            try {
                useCashFlowStore.getState().notifyAmountChange(userId, incomeYear);
            } catch (error) {
                console.warn('Failed to refresh cash flow for year', incomeYear, error);
            }
            return formattedIncome;
        },

        updateIncome: async (userId: string, incomeId: string, updates: { category_id?: number; amount?: string; notes?: string; income_date?: string }) => {
            const updatedIncome = await incomeApi.updateIncome(userId, incomeId, updates);
            let categoryName = 'Unknown';
            if (updates.category_id) {
                const categoryObj = get().categories.find(cat => cat.id === updates.category_id!.toString());
                if (categoryObj) {
                    categoryName = categoryObj.name;
                }
            }
            const updatedDate = updates.income_date ? formatISODate(new Date(updates.income_date)) : null;
            const updatedTime = updatedIncome.created_at ? formatTime(updatedIncome.created_at) : null;
            set(state => {
                const newCache = { ...state.monthlyCache };
                for (const monthKey of Object.keys(newCache)) {
                    const monthData = newCache[monthKey];
                    const incomeIndex = monthData.incomes.findIndex(inc => inc.id === incomeId);
                    if (incomeIndex !== -1) {
                        const currentIncome = monthData.incomes[incomeIndex];
                        const updatedIncomeObj: Income = {
                            id: currentIncome.id,
                            amount: updates.amount ? parseCostToNumber(updates.amount) : currentIncome.amount,
                            description: updates.notes !== undefined ? updates.notes : currentIncome.description,
                            category: updates.category_id ? categoryName : currentIncome.category,
                            categoryId: updates.category_id ? updates.category_id.toString() : currentIncome.categoryId,
                            date: updatedDate || currentIncome.date,
                            time: updatedTime || currentIncome.time
                        };
                        const updatedIncomes = [...monthData.incomes];
                        updatedIncomes.splice(incomeIndex, 1);
                        newCache[monthKey] = {
                            ...monthData,
                            incomes: updatedIncomes
                        };
                        let targetMonthKey: string;
                        if (updates.income_date) {
                            const incomeDate = new Date(updates.income_date);
                            const incomeYear = incomeDate.getFullYear();
                            const incomeMonth = incomeDate.getMonth() + 1;
                            targetMonthKey = get().getMonthKey(incomeYear, incomeMonth);
                        } else {
                            targetMonthKey = monthKey;
                        }
                        if (!newCache[targetMonthKey]) {
                            newCache[targetMonthKey] = {
                                incomes: [],
                                isLoading: false,
                                lastLoaded: Date.now()
                            };
                        }
                        newCache[targetMonthKey] = {
                            ...newCache[targetMonthKey],
                            incomes: [updatedIncomeObj, ...newCache[targetMonthKey].incomes]
                        };
                        newCache[targetMonthKey].incomes.sort((a, b) => 
                            new Date(b.date).getTime() - new Date(a.date).getTime()
                        );
                        break;
                    }
                }
                return { monthlyCache: newCache };
            });
            try {
                const currentYear = new Date().getFullYear();
                const targetYear = updates.income_date ? new Date(updates.income_date).getFullYear() : currentYear;
                useCashFlowStore.getState().notifyAmountChange(userId, targetYear);
            } catch (error) {
                console.warn('Failed to refresh cash flow after income update', error);
            }
        },

        deleteIncome: async (userId: string, incomeId: string) => {
            const { monthlyCache } = get();
            let incomeYear: number | null = null;
            for (const monthKey of Object.keys(monthlyCache)) {
                const income = monthlyCache[monthKey].incomes.find(inc => inc.id === incomeId);
                if (income) {
                    incomeYear = new Date(income.date).getFullYear();
                    break;
                }
            }
            await incomeApi.deleteIncome(userId, incomeId);
            set(state => {
                const newCache = { ...state.monthlyCache };
                Object.keys(newCache).forEach(monthKey => {
                    const monthData = newCache[monthKey];
                    newCache[monthKey] = {
                        ...monthData,
                        incomes: monthData.incomes.filter(income => income.id !== incomeId)
                    };
                });
                return { monthlyCache: newCache };
            });
            if (incomeYear) {
                try {
                    useCashFlowStore.getState().notifyAmountChange(userId, incomeYear);
                } catch (error) {
                    console.warn('Failed to refresh cash flow after income deletion', error);
                }
            }
        },

        getIncomesForMonth: (year: number, month: number) => {
            const monthKey = get().getMonthKey(year, month);
            return get().monthlyCache[monthKey]?.incomes || [];
        },

        getCurrentMonthIncomes: () => {
            const { currentYear, currentMonth } = get();
            return get().getIncomesForMonth(currentYear, currentMonth);
        },

        getRecentIncomes: (limit: number = 10) => {
            const currentIncomes = get().getCurrentMonthIncomes();
            return currentIncomes.slice(0, limit);
        },

        getTotalForMonth: (year: number, month: number) => {
            const incomes = get().getIncomesForMonth(year, month);
            return incomes.reduce((sum: number, income: Income) => sum + income.amount, 0);
        },

        getCurrentMonthTotal: () => {
            const { currentYear, currentMonth } = get();
            return get().getTotalForMonth(currentYear, currentMonth);
        },

        isLoadingMonth: (year: number, month: number) => {
            const monthKey = get().getMonthKey(year, month);
            return get().monthlyCache[monthKey]?.isLoading || false;
        },

        getCategoryIcon: (categoryId: string) => {
            const category = get().categories.find(cat => cat.id === categoryId);
            return category?.icon || '💰';
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
