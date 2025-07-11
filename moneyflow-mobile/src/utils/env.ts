/**
 * Simple environment variable loader for React Native
 * This file specifically handles loading from @env module
 */

let envVars: any = null;

// Load environment variables once
const loadEnvVars = () => {
    if (envVars) return envVars;
    
    try {
        // Try the standard @env import
        envVars = require('@env');
        console.log('Successfully loaded environment variables from @env');
        return envVars;
    } catch (error: any) {
        console.warn('Failed to load @env module:', error?.message || 'Unknown error');
        
        // Fallback to default values
        envVars = {
            TZ: 'Asia/Manila',
            API_URL: '',
            APP_VERSION: '1.0.0',
            ACCESS_TOKEN_KEY_NAME: '_rs12b_xt',
            SECRET_KEY_ACCESS_TOKEN: ''
        };
        return envVars;
    }
};

export const getEnvVar = (key: string, defaultValue: string = '') => {
    const env = loadEnvVars();
    return env[key] || defaultValue;
};

export const getTimezone = () => getEnvVar('TZ', 'Asia/Manila');
