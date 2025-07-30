export interface Expense {
    id: string;
    cost: string;
    notes: string;
    expense_date: string;
}

export interface Income {
    id: string;
    amount: string;
    notes: string;
    income_date: string;
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
