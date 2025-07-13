/**
 * Quick test to verify the date logic used in ExpenseScreen
 */

// Simulate the createTodayWithDay function from dateUtils
const createTodayWithDay = (day) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    
    // Create date string in ISO format
    const monthStr = String(month + 1).padStart(2, '0'); // month is 0-indexed
    const dayStr = String(day).padStart(2, '0');
    
    return `${year}-${monthStr}-${dayStr}`;
};

// Test the logic used in ExpenseScreen
console.log('Testing expense date creation logic:');
console.log('Current date:', new Date().toISOString());
console.log('Current day of month:', new Date().getDate());

const currentDay = new Date().getDate();
const expenseDate = createTodayWithDay(currentDay);

console.log('Generated expense_date:', expenseDate);
console.log('Expected format: YYYY-MM-DD');
console.log('Matches today?', expenseDate === new Date().toISOString().split('T')[0]);

// Test with different days to make sure it's working
console.log('\nTesting with different days:');
for (let day = 1; day <= 5; day++) {
    console.log(`Day ${day}:`, createTodayWithDay(day));
}
