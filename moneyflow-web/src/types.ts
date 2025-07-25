
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
    id: string;
    name: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
}


export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}