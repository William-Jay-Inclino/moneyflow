/**
 * Utility functions for handling cost/amount parsing and formatting
 */

/**
 * Safely converts cost values to numbers, handling various input types
 * including Prisma Decimal objects, strings, and numbers
 */
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

/**
 * Formats cost input by removing non-numeric characters except decimal point
 * and ensuring only one decimal point exists
 */
export const formatCostInput = (value: string): string => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    const formattedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
    return formattedValue;
};

/**
 * Validates if a cost string is a valid positive number
 */
export const isValidCost = (cost: string): boolean => {
    if (!cost.trim()) return false;
    const parsed = parseFloat(cost.trim());
    return !isNaN(parsed) && parsed > 0;
};
