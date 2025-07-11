/**
 * Utility functions for date formatting
 */

import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { getTimezone } from './config';

/**
 * Formats a date string to MM/DD format using the configured timezone
 */
export const formatDate = (dateString: string): string => {
    try {
        const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
        return formatInTimeZone(date, getTimezone(), 'MM/dd');
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
 * Formats a date to a time string in 12-hour format using the configured timezone
 */
export const formatTime = (dateString: string): string => {
    try {
        const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
        return formatInTimeZone(date, getTimezone(), 'h:mm a');
    } catch (error) {
        console.warn('Error formatting time:', error);
        // Fallback to simple format
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
};

/**
 * Formats a date to ISO date string (YYYY-MM-DD) in the configured timezone
 */
export const formatISODate = (date: Date): string => {
    try {
        return formatInTimeZone(date, getTimezone(), 'yyyy-MM-dd');
    } catch (error) {
        console.warn('Error formatting ISO date:', error);
        // Fallback to simple format
        return date.toISOString().split('T')[0];
    }
};

/**
 * Formats a date to a full date string with timezone
 */
export const formatFullDate = (dateString: string): string => {
    try {
        const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
        return formatInTimeZone(date, getTimezone(), 'MMM dd, yyyy');
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
        const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
        return formatInTimeZone(date, getTimezone(), 'MMM dd, yyyy h:mm a');
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
 * Gets the current date in the configured timezone
 */
export const getCurrentDate = (): Date => {
    return new Date();
};

/**
 * Gets the current date formatted as ISO string in the configured timezone
 */
export const getCurrentISODate = (): string => {
    return formatISODate(new Date());
};
