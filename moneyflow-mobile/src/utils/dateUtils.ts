

// Use Asia/Manila timezone for all formatting
const TIMEZONE = 'Asia/Manila';

/**
 * Parses ISO date string or Date object to Date (local time)
 */
const parseDate = (date: string | Date): Date => {
    if (typeof date === 'string') {
        // Try to parse ISO string
        const d = new Date(date);
        if (!isNaN(d.getTime())) return d;
    }
    if (date instanceof Date) return date;
    return new Date();
};

/**
 * Formats a date string to MM/DD format in Asia/Manila timezone
 */
export const formatDate = (dateString: string): string => {
    try {
        const date = parseDate(dateString);
        // Convert to Asia/Manila time
        const options: Intl.DateTimeFormatOptions = { timeZone: TIMEZONE, month: '2-digit', day: '2-digit' };
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        console.warn('Error formatting date:', error);
        // Fallback to simple format
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}/${day}`;
    }
};

/**
 * Formats a date to a time string in 12-hour format in Asia/Manila timezone
 */
export const formatTime = (dateString: string): string => {
    try {
        const date = parseDate(dateString);
        const options: Intl.DateTimeFormatOptions = { timeZone: TIMEZONE, hour: 'numeric', minute: '2-digit', hour12: true };
        return date.toLocaleTimeString('en-US', options);
    } catch (error) {
        console.warn('Error formatting time:', error);
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
};

/**
 * Formats a date to ISO date string (YYYY-MM-DD) in Asia/Manila timezone
 */
export const formatISODate = (date: Date): string => {
    try {
        // Get year, month, day in Asia/Manila
        const options: Intl.DateTimeFormatOptions = { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' };
        const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(date);
        const year = parts.find(p => p.type === 'year')?.value || '';
        const month = parts.find(p => p.type === 'month')?.value || '';
        const day = parts.find(p => p.type === 'day')?.value || '';
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.warn('Error formatting ISO date:', error);
        return date.toISOString().split('T')[0];
    }
};

/**
 * Formats a date to a full date string with timezone
 */
export const formatFullDate = (dateString: string): string => {
    try {
        const date = parseDate(dateString);
        const options: Intl.DateTimeFormatOptions = { timeZone: TIMEZONE, year: 'numeric', month: 'short', day: '2-digit' };
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        console.warn('Error formatting full date:', error);
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
};

/**
 * Formats a date to a full date and time string with timezone
 */
export const formatDateTime = (dateString: string): string => {
    try {
        const date = parseDate(dateString);
        const options: Intl.DateTimeFormatOptions = { 
            timeZone: TIMEZONE, 
            year: 'numeric', 
            month: 'short', 
            day: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };
        return date.toLocaleString('en-US', options);
    } catch (error) {
        console.warn('Error formatting datetime:', error);
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }
};

/**
 * Gets the current date in Asia/Manila timezone
 */
export const getCurrentDate = (): Date => {
    // Returns local JS Date, but formatting will use Asia/Manila
    return new Date();
};

/**
 * Gets the current date formatted as ISO string in Asia/Manila timezone
 */
export const getCurrentISODate = (): string => {
    return formatISODate(new Date());
};

/**
 * Creates a date in Asia/Manila timezone with specific year, month, and day
 * Returns the date as ISO string format that the backend expects
 */
export const createDateInTimezone = (year: number, month: number, day: number): string => {
    try {
        // month is 0-indexed
        const date = new Date(Date.UTC(year, month, day));
        // Format as YYYY-MM-DD in Asia/Manila
        return formatISODate(date);
    } catch (error) {
        console.warn('Error creating date in timezone:', error);
        const monthStr = String(month + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        return `${year}-${monthStr}-${dayStr}`;
    }
};

/**
 * Creates a date in Asia/Manila timezone using just the day (current month/year)
 */
export const createTodayWithDay = (day: number): string => {
    const now = new Date();
    return createDateInTimezone(now.getFullYear(), now.getMonth(), day);
};

/**
 * Parses a date string and extracts day, month, year in Asia/Manila timezone
 */
export const parseDateComponents = (dateString: string): { day: number; month: number; year: number } => {
    try {
        const date = parseDate(dateString);
        const options: Intl.DateTimeFormatOptions = { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' };
        const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(date);
        const year = parseInt(parts.find(p => p.type === 'year')?.value || '', 10);
        const month = parseInt(parts.find(p => p.type === 'month')?.value || '', 10) - 1; // 0-indexed
        const day = parseInt(parts.find(p => p.type === 'day')?.value || '', 10);
        return { day, month, year };
    } catch (error) {
        console.warn('Error parsing date components:', error);
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear()
        };
    }
};
