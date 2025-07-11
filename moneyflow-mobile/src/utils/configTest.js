/**
 * Quick test to verify config loading works without errors
 */

const { getConfig, getTimezone } = require('./config.ts');

console.log('Testing config loading...');

try {
    const config = getConfig();
    console.log('✅ Config loaded successfully:', {
        TZ: config.TZ,
        API_URL: config.API_URL ? '***configured***' : 'not set',
    });
    
    const timezone = getTimezone();
    console.log('✅ Timezone loaded:', timezone);
    
    console.log('🎉 All config tests passed!');
} catch (error) {
    console.error('❌ Config test failed:', error.message);
}
