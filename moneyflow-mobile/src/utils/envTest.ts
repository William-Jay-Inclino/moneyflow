/**
 * Test environment variable loading
 * Call this function from your app to debug environment variable loading
 */

export const testEnvLoading = () => {
    console.log('=== Environment Variable Loading Test ===');
    
    // Test 1: Direct require
    try {
        const env1 = require('@env');
        console.log('✅ Direct require(@env) success:', env1);
    } catch (error: any) {
        console.log('❌ Direct require(@env) failed:', error?.message);
    }
    
    // Test 2: Check if variables are available in global scope
    try {
        const global_any = global as any;
        console.log('Global __ENV__:', global_any.__ENV__);
        console.log('Process.env.TZ:', process?.env?.TZ);
    } catch (error: any) {
        console.log('❌ Global check failed:', error?.message);
    }
    
    // Test 3: Check current working directory and .env file
    console.log('Current working directory should contain .env file');
    
    // Test 4: Test our utility functions
    try {
        const { getConfig, getTimezone } = require('./config');
        console.log('✅ Config utility test:');
        console.log('- Timezone:', getTimezone());
        console.log('- Full config:', getConfig());
    } catch (error: any) {
        console.log('❌ Config utility test failed:', error?.message);
    }
    
    console.log('=== End Test ===');
};
