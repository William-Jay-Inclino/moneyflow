/**
 * Test offline expense date creation - simulating the exact ExpenseScreen logic
 */

// Import the actual date functions (simplified versions)
const formatInTimeZone = (date, timeZone, formatStr) => {
    // Simplified version for testing
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: timeZone
    };
    
    const parts = new Intl.DateTimeFormat('en-CA', options).format(date);
    return parts; // Returns YYYY-MM-DD
};

const createDateInTimezone = (year, month, day) => {
    // month is 0-indexed in the function parameter
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
};

const createTodayWithDay = (day) => {
    const now = new Date();
    return createDateInTimezone(now.getFullYear(), now.getMonth(), day);
};

// Test the exact logic used in ExpenseScreen
console.log('=== Simulating ExpenseScreen Offline Date Creation ===');
console.log('Current system time:', new Date().toISOString());
console.log('Current time in Manila:', new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));

// Exact logic from ExpenseScreen handleAddExpense
const currentDay = new Date().getDate();
const expenseDate = createTodayWithDay(currentDay);

console.log('\nExpenseScreen logic:');
console.log('currentDay =', currentDay);
console.log('expenseDate =', expenseDate);

// What should it be?
const expectedTodayManila = formatInTimeZone(new Date(), 'Asia/Manila', 'yyyy-MM-dd');
const expectedTodayUTC = new Date().toISOString().split('T')[0];

console.log('\nComparison:');
console.log('Generated expense_date:', expenseDate);
console.log('Expected (Manila TZ):', expectedTodayManila);
console.log('Expected (UTC):', expectedTodayUTC);

// Check if there's a timezone issue
const manilaDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
console.log('Manila date (en-CA):', manilaDate);

// Simulate what happens at different times of day
console.log('\n=== Timezone Edge Case Test ===');
// Test with a time that might be on different dates in different timezones
const testTime = new Date('2025-07-13T16:00:00.000Z'); // 4 PM UTC
console.log('Test time UTC:', testTime.toISOString());
console.log('Test time Manila:', testTime.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));

const testCurrentDay = testTime.getDate();
const testExpenseDate = createDateInTimezone(testTime.getFullYear(), testTime.getMonth(), testCurrentDay);
const testManilaDate = testTime.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

console.log('Test - extracted day:', testCurrentDay);
console.log('Test - generated expense_date:', testExpenseDate);
console.log('Test - expected Manila date:', testManilaDate);

if (testExpenseDate !== testManilaDate) {
    console.log('❌ TIMEZONE ISSUE DETECTED!');
    console.log('The date extraction is using local/UTC time instead of Manila timezone');
} else {
    console.log('✅ Timezone handling looks correct');
}
