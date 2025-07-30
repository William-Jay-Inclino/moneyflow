import { AUTH_KEY } from "./config";
import type { AuthUser } from "./types";


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