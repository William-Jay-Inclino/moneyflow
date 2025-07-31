export interface Expense {
    id: string;
    cost: string;
    notes: string;
    expense_date: string;
    category?: Category;
}

export interface Income {
    id: string;
    amount: string;
    notes: string;
    income_date: string;
    category?: Category;
}

export interface AuthUser {
    user_id: string 
    email: string
    token: string
}

export interface User {
    id: string;
    email: string;
}

export interface Category {
    id: number;
    name: string;
    amount: number;
    color: string;
    icon: string;
    type: 'INCOME' | 'EXPENSE';
}

export interface UserAccount {
    id: string;
    user_id: string;
    name: string;
    balance: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    user?: User
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}


export interface CashFlowData {
    months: CFMonth[]
    year: number
    yearSummary: {
        totalCashFlow: number
        totalIncome: number 
        totalExpense: number
    }
}

export interface CFMonth {
    month: number
    monthName: string
    totalIncome: number
    totalExpense: number
    netCashFlow: number
}


export interface CFYearSummary {
    totalIncome: number
    totalExpense: number
    incomeCategories: Category[]
    expenseCategories: Category[]
}
