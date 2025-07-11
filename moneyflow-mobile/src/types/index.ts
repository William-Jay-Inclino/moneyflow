export interface User {
    id: string;
    email: string;
    name?: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

// JWT Auth Response Types
export interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface VerificationResponse {
    message: string;
    user: User;
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
    date?: string; // Keep for backwards compatibility
    expense_date?: string; // For expenses
    income_date?: string; // For income
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
    email: string;
    password: string;
}

export interface VerifyEmailRequest {
    email: string;
    code: string;
}

export interface ResendVerificationRequest {
    email: string;
}

export interface CreateTransactionRequest {
    amount: number;
    description: string;
    categoryId: string;
    expense_date?: string; // For expenses
    income_date?: string; // For income
    date?: string; // Keep for backwards compatibility
    type: 'income' | 'expense';
}

export interface CreateCategoryRequest {
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense';
}

// Navigation types
export * from './navigation';
