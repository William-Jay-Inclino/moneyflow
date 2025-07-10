import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * JWT Token utilities for mobile app
 */

// React Native compatible base64 decoder
const base64Decode = (str: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let result = '';
  
  // Add padding if needed
  str += '=='.slice(2 - (str.length & 3));
  
  for (let i = 0; i < str.length;) {
    const a = chars.indexOf(str.charAt(i++));
    const b = chars.indexOf(str.charAt(i++));
    const c = chars.indexOf(str.charAt(i++));
    const d = chars.indexOf(str.charAt(i++));

    const bitmap = (a << 18) | (b << 12) | (c << 6) | d;

    result += String.fromCharCode((bitmap >> 16) & 255);
    if (c !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
    if (d !== 64) result += String.fromCharCode(bitmap & 255);
  }
  
  return result;
};

export const tokenUtils = {
  /**
   * Decode JWT payload (without verification - for checking expiry)
   */
  decodeJWTPayload: (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        console.warn('Invalid JWT token format');
        return null;
      }
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        base64Decode(base64)
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
    try {
      const payload = tokenUtils.decodeJWTPayload(token);
      if (!payload || !payload.exp) {
        console.warn('JWT token has no expiration (exp) claim');
        return true;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < currentTime;
      
      if (isExpired) {
        console.log(`🔄 JWT token expired. Exp: ${payload.exp}, Current: ${currentTime}`);
      } else {
        console.log(`✅ JWT token valid. Exp: ${payload.exp}, Current: ${currentTime}, Valid for: ${payload.exp - currentTime}s`);
      }
      
      return isExpired;
    } catch (error) {
      console.warn('Error checking token expiration:', error);
      return true;
    }
  },

  /**
   * Get stored token and check if it's valid
   */
  getValidToken: async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('auth-token');
      if (!token) {
        console.log('🔍 No JWT token found in storage');
        return null;
      }

      console.log('🔍 Checking JWT token validity...');
      if (tokenUtils.isTokenExpired(token)) {
        console.log('🔄 JWT token is expired, removing...');
        await AsyncStorage.removeItem('auth-token');
        return null;
      }

      console.log('✅ JWT token is valid');
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
  },

  /**
   * Debug function to test JWT token decoding
   */
  debugToken: (token: string) => {
    console.log('🔍 Debug: Testing JWT token...');
    console.log('🔍 Token length:', token.length);
    console.log('🔍 Token parts:', token.split('.').length);
    
    const payload = tokenUtils.decodeJWTPayload(token);
    console.log('🔍 Decoded payload:', payload);
    
    if (payload) {
      console.log('🔍 Token expiry (exp):', payload.exp);
      console.log('🔍 Current time:', Math.floor(Date.now() / 1000));
      console.log('🔍 Is expired:', tokenUtils.isTokenExpired(token));
    }
  }
};
