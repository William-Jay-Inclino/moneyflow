/**
 * Test current date creation for expense tracking
 */

// Test the current implementation
const createTodayWithDay = (day) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    
    // Create date string in ISO format
    const monthStr = String(month + 1).padStart(2, '0'); // month is 0-indexed
    const dayStr = String(day).padStart(2, '0');
    
    return `${year}-${monthStr}-${dayStr}`;
};

// Test what's happening
console.log('=== Current Date Creation Test ===');
console.log('Current system date:', new Date().toISOString());
console.log('Current date in Manila timezone:', new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));

const now = new Date();
console.log('Year:', now.getFullYear());
console.log('Month (0-indexed):', now.getMonth());
console.log('Month (human readable):', now.getMonth() + 1);
console.log('Day:', now.getDate());

// Current implementation
const currentDay = now.getDate();
const expenseDate = createTodayWithDay(currentDay);
console.log('Generated expense_date:', expenseDate);

// Alternative: use today's date directly
const todayISO = now.toISOString().split('T')[0];
console.log('Alternative - today ISO:', todayISO);

// Test with Manila timezone
const manilaDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }); // en-CA gives YYYY-MM-DD format
console.log('Manila timezone date:', manilaDate);

// Show potential issue
console.log('\n=== Potential Issue Analysis ===');
if (expenseDate !== todayISO && expenseDate !== manilaDate) {
    console.log('❌ ISSUE: Generated date does not match today\'s date');
    console.log('Expected (ISO):', todayISO);
    console.log('Expected (Manila):', manilaDate);
    console.log('Generated:', expenseDate);
} else {
    console.log('✅ Date generation looks correct');
}
