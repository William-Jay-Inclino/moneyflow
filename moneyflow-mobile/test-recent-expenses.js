// Simple test to check recent expenses functionality
import { useExpenseStore } from './src/store';

// Mock user data
const testUser = { id: '1' };

// Function to test recent expenses
const testRecentExpenses = () => {
    console.log('Testing Recent Expenses...');
    
    const store = useExpenseStore.getState();
    
    // Check current state
    console.log('Current month:', store.currentMonth);
    console.log('Current year:', store.currentYear);
    console.log('Categories:', store.categories.length);
    console.log('Monthly cache keys:', Object.keys(store.monthlyCache));
    
    // Get recent expenses
    const recentExpenses = store.getRecentExpenses(10);
    console.log('Recent expenses count:', recentExpenses.length);
    console.log('Recent expenses:', recentExpenses);
    
    // Get current month expenses
    const currentMonthExpenses = store.getCurrentMonthExpenses();
    console.log('Current month expenses count:', currentMonthExpenses.length);
    console.log('Current month expenses:', currentMonthExpenses);
    
    // Check if data is loaded
    const monthKey = store.getMonthKey(store.currentYear, store.currentMonth);
    const monthData = store.monthlyCache[monthKey];
    console.log('Month data loaded:', !!monthData);
    console.log('Month data:', monthData);
    
    return {
        recentExpenses,
        currentMonthExpenses,
        monthDataLoaded: !!monthData
    };
};

// Export for use in debugging
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testRecentExpenses };
}

console.log('Test file loaded. Run testRecentExpenses() to debug.');
