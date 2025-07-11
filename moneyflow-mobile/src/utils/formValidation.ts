/**
 * Utility functions for form validation
 */

import { isValidCost } from './costUtils';

/**
 * Validates expense form data
 */
export const validateExpenseForm = (
    cost: string, 
    notes: string, 
    categoryId: string, 
    userId?: string
): string | null => {
    if (!cost.trim()) return 'Please enter the expense amount';
    if (!isValidCost(cost)) return 'Please enter a valid positive amount';
    if (!notes.trim()) return 'Please enter notes';
    if (!categoryId) return 'Please select a category';
    if (!userId) return 'User not found. Please login again.';
    return null;
};

/**
 * Validates income form data
 */
export const validateIncomeForm = (
    amount: string, 
    notes: string, 
    categoryId: string, 
    userId?: string
): string | null => {
    if (!amount.trim()) return 'Please enter the income amount';
    if (!isValidCost(amount)) return 'Please enter a valid positive amount';
    if (!notes.trim()) return 'Please enter notes';
    if (!categoryId) return 'Please select a category';
    if (!userId) return 'User not found. Please login again.';
    return null;
};

/**
 * Validates required text fields
 */
export const validateRequiredField = (value: string, fieldName: string): string | null => {
    if (!value.trim()) return `Please enter ${fieldName}`;
    return null;
};
