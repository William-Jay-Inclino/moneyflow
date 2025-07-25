

export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function formatAmount(num: number): string {
    return num.toLocaleString('en-US');
}