/**
 * Configuration utilities for the app
 * Safely loads environment variables with fallbacks
 */

// Import environment variables safely
let envVars: any = {};
try {
    // This will be transformed by babel-plugin-transform-inline-environment-variables
    envVars = require('@env');
} catch (error) {
    // If @env is not available, use empty object
    envVars = {};
}

// Default values from .env file (hardcoded as fallback)
const defaults = {
    TZ: 'Asia/Manila',
    API_URL: 'https://jaytechsolutions.cloud/moneyflow/api',
    APP_VERSION: '1.0.0',
    ACCESS_TOKEN_KEY_NAME: '_rs12b_xt',
    SECRET_KEY_ACCESS_TOKEN: '8e92a7c4a50f49f3bca1eae6433f2b06a1fd938ddc0f7f68d72a1c34e6cbf0c9',
};

// Configuration object with all app settings
export const getConfig = () => {
    return {
        TZ: envVars.TZ || defaults.TZ,
        API_URL: envVars.API_URL || defaults.API_URL,
        APP_VERSION: envVars.APP_VERSION || defaults.APP_VERSION,
        ACCESS_TOKEN_KEY_NAME: envVars.ACCESS_TOKEN_KEY_NAME || defaults.ACCESS_TOKEN_KEY_NAME,
        SECRET_KEY_ACCESS_TOKEN: envVars.SECRET_KEY_ACCESS_TOKEN || defaults.SECRET_KEY_ACCESS_TOKEN,
    };
};

export const getTimezone = () => {
    return envVars.TZ || defaults.TZ;
};
