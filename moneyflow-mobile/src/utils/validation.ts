export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

export const formatValidationErrors = (errors: string[]): string => {
    return errors.join('\n');
};
