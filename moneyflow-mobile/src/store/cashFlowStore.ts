import { create } from 'zustand';
import { cashFlowApi } from '../services/api';

interface CashFlowData {
    months: Array<{
        name: string;
        income: number;
        expense: number;
        cashFlow: number;
        monthIndex: number;
    }>;
    summary: {
        totalIncome: number;
        totalExpense: number;
        totalCashFlow: number;
    };
}

interface CashFlowStore {
    // Cache by year
    yearlyCache: { [year: number]: CashFlowData | null };
    loadingYears: Set<number>;
    
    // Actions
    loadCashFlowForYear: (userId: string, year: number) => Promise<void>;
    refreshCashFlowForYear: (userId: string, year: number) => Promise<void>;
    getCashFlowForYear: (year: number) => CashFlowData | null;
    isLoadingYear: (year: number) => boolean;
    
    // Trigger refresh for a specific year (called from income/expense stores)
    notifyAmountChange: (userId: string, year: number) => Promise<void>;
}

export const useCashFlowStore = create<CashFlowStore>((set, get) => ({
    yearlyCache: {},
    loadingYears: new Set(),

    loadCashFlowForYear: async (userId: string, year: number) => {
        if (!userId || get().loadingYears.has(year)) {
            return;
        }

        const cached = get().yearlyCache[year];
        if (cached) {
            return; // Already loaded
        }

        set(state => ({
            loadingYears: new Set([...state.loadingYears, year])
        }));

        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const data = await cashFlowApi.getCashFlowByYear(userId, year, timezone);
            
            // Transform API data to our format
            const transformedData: CashFlowData = {
                months: data.months.map((month: any) => ({
                    name: month.monthName,
                    income: month.totalIncome,
                    expense: month.totalExpense,
                    cashFlow: month.netCashFlow,
                    monthIndex: month.month - 1
                })),
                summary: {
                    totalIncome: data.yearSummary.totalIncome,
                    totalExpense: data.yearSummary.totalExpense,
                    totalCashFlow: data.yearSummary.totalCashFlow
                }
            };

            set(state => ({
                yearlyCache: {
                    ...state.yearlyCache,
                    [year]: transformedData
                },
                loadingYears: new Set([...state.loadingYears].filter(y => y !== year))
            }));
        } catch (error) {
            console.error(`Error loading cash flow for year ${year}:`, error);
            set(state => ({
                loadingYears: new Set([...state.loadingYears].filter(y => y !== year))
            }));
        }
    },

    refreshCashFlowForYear: async (userId: string, year: number) => {
        if (!userId || get().loadingYears.has(year)) {
            return;
        }

        set(state => ({
            loadingYears: new Set([...state.loadingYears, year])
        }));

        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const data = await cashFlowApi.getCashFlowByYear(userId, year, timezone);
            
            // Transform API data to our format
            const transformedData: CashFlowData = {
                months: data.months.map((month: any) => ({
                    name: month.monthName,
                    income: month.totalIncome,
                    expense: month.totalExpense,
                    cashFlow: month.netCashFlow,
                    monthIndex: month.month - 1
                })),
                summary: {
                    totalIncome: data.yearSummary.totalIncome,
                    totalExpense: data.yearSummary.totalExpense,
                    totalCashFlow: data.yearSummary.totalCashFlow
                }
            };

            set(state => ({
                yearlyCache: {
                    ...state.yearlyCache,
                    [year]: transformedData
                },
                loadingYears: new Set([...state.loadingYears].filter(y => y !== year))
            }));

            console.log(`✅ Cash flow refreshed for year ${year}`);
        } catch (error) {
            console.error(`Error refreshing cash flow for year ${year}:`, error);
            set(state => ({
                loadingYears: new Set([...state.loadingYears].filter(y => y !== year))
            }));
        }
    },

    getCashFlowForYear: (year: number) => {
        return get().yearlyCache[year] || null;
    },

    isLoadingYear: (year: number) => {
        return get().loadingYears.has(year);
    },

    notifyAmountChange: async (userId: string, year: number) => {
        // This is called when income/expense amounts change
        // It refreshes the cash flow for the affected year
        const { refreshCashFlowForYear } = get();
        await refreshCashFlowForYear(userId, year);
    }
}));
