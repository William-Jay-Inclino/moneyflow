export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense';
    userId: string;
}

export interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string;
    categoryId: string;
    category: Category;
    userId: string;
    type: 'income' | 'expense';
    createdAt: string;
    updatedAt: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

export interface TransactionState {
    transactions: Transaction[];
    categories: Category[];
    isLoading: boolean;
    totalIncome: number;
    totalExpenses: number;
    balance: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface CreateTransactionRequest {
    amount: number;
    description: string;
    categoryId: string;
    date: string;
    type: 'income' | 'expense';
}

export interface CreateCategoryRequest {
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense';
}
