

export interface User {
    id: string;
    email: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense';
}


export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}