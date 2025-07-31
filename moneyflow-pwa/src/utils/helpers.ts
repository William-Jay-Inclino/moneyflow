import type { AuthUser } from "../types";
import { AUTH_KEY } from "./config";
import { toZonedTime, format } from 'date-fns-tz';

export function formatDate(dateString: string, withYear = false): string {
    const dateObj = new Date(dateString);
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();

    return withYear ? `${month} ${day}, ${year}` : `${month} ${day}`;
}

export function convertToDateString(year: number, month: number, day: number): string {
    const date = new Date(Date.UTC(year, month - 1, day));
    const manilaTime = toZonedTime(date, 'Asia/Manila');
    return format(manilaTime, 'yyyy-MM-dd', { timeZone: 'Asia/Manila' });
}

export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function formatAmount(num: number | string): string {
    const parsed = typeof num === 'string' ? parseFloat(num) : num;

    if (isNaN(parsed)) {
        return 'Invalid amount';
    }

    return parsed.toLocaleString('en-US');
}

export function get_auth_user_in_local_storage(): AuthUser | null {
    const user_local = localStorage.getItem(AUTH_KEY)
    if (!user_local) return null;
    try {
        const user = JSON.parse(user_local)
        if (
            user &&
            typeof user === 'object' &&
            typeof user.user_id === 'string' &&
            typeof user.email === 'string' &&
            typeof user.token === 'string'
        ) {
            return user
        }
    } catch (e) {
        console.warn('Failed to parse auth user from localStorage:', e)
    }
    return null
}


export function set_auth_user_in_local_storage(user: AuthUser) {
    console.log('set_auth_user', user);
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
}



export const parseCostToNumber = (cost: any): number => {
    if (cost === null || cost === undefined) return 0;
    
    // If it's already a number, return it
    if (typeof cost === 'number') return cost;
    
    // Handle Prisma Decimal objects (they have a toString method)
    if (cost && typeof cost === 'object' && typeof cost.toString === 'function') {
        const stringValue = cost.toString();
        const parsed = parseFloat(stringValue);
        return isNaN(parsed) ? 0 : parsed;
    }
    
    // If it's a string, clean and parse it
    if (typeof cost === 'string') {
        // Remove any whitespace and handle empty strings
        const cleanCost = cost.trim();
        if (cleanCost === '') return 0;
        
        // Parse the string to float
        const parsed = parseFloat(cleanCost);
        return isNaN(parsed) ? 0 : parsed;
    }
    
    console.warn('Unexpected cost type:', typeof cost, cost);
    return 0;
};