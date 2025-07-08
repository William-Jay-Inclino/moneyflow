import { create } from 'zustand';
import { TransactionState, Transaction, Category } from '@/types';

interface TransactionStore extends TransactionState {
    setTransactions: (transactions: Transaction[]) => void;
    setCategories: (categories: Category[]) => void;
    setLoading: (loading: boolean) => void;
    addTransaction: (transaction: Transaction) => void;
    updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;
    addCategory: (category: Category) => void;
    updateCategory: (id: string, category: Partial<Category>) => void;
    deleteCategory: (id: string) => void;
    calculateTotals: () => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
    transactions: [],
    categories: [],
    isLoading: false,
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,

    setTransactions: (transactions: Transaction[]) => {
        set({ transactions });
        get().calculateTotals();
    },

    setCategories: (categories: Category[]) => set({ categories }),
    setLoading: (isLoading: boolean) => set({ isLoading }),

    addTransaction: (transaction: Transaction) => {
        set(state => ({ transactions: [...state.transactions, transaction] }));
        get().calculateTotals();
    },

    updateTransaction: (
        id: string,
        updatedTransaction: Partial<Transaction>
    ) => {
        set(state => ({
            transactions: state.transactions.map(t =>
                t.id === id ? { ...t, ...updatedTransaction } : t
            ),
        }));
        get().calculateTotals();
    },

    deleteTransaction: (id: string) => {
        set(state => ({
            transactions: state.transactions.filter(t => t.id !== id),
        }));
        get().calculateTotals();
    },

    addCategory: (category: Category) => {
        set(state => ({ categories: [...state.categories, category] }));
    },

    updateCategory: (id: string, updatedCategory: Partial<Category>) => {
        set(state => ({
            categories: state.categories.map(c =>
                c.id === id ? { ...c, ...updatedCategory } : c
            ),
        }));
    },

    deleteCategory: (id: string) => {
        set(state => ({
            categories: state.categories.filter(c => c.id !== id),
        }));
    },

    calculateTotals: () => {
        const { transactions } = get();
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        set({
            totalIncome: income,
            totalExpenses: expenses,
            balance: income - expenses,
        });
    },
}));
