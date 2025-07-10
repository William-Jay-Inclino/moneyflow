import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * JWT Token utilities for mobile app
 */

export const tokenUtils = {
  /**
   * Decode JWT payload (without verification - for checking expiry)
   */
  decodeJWTPayload: (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.warn('Failed to decode JWT payload:', error);
      return null;
    }
  },

  /**
   * Check if JWT token is expired
   */
  isTokenExpired: (token: string): boolean => {
    const payload = tokenUtils.decodeJWTPayload(token);
    if (!payload || !payload.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  },

  /**
   * Get stored token and check if it's valid
   */
  getValidToken: async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('auth-token');
      if (!token) {
        return null;
      }

      if (tokenUtils.isTokenExpired(token)) {
        console.log('🔄 JWT token is expired, removing...');
        await AsyncStorage.removeItem('auth-token');
        return null;
      }

      return token;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return null;
    }
  },

  /**
   * Clear expired token and trigger logout
   */
  clearExpiredToken: async (): Promise<void> => {
    await AsyncStorage.removeItem('auth-token');
    console.log('🔄 Expired JWT token cleared');
  }
};
