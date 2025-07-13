import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ExpenseItem, CategoryChip } from '../../components';
import { useAuthStore, useExpenseStore } from '../../store';
import { formatCostInput } from '../../utils/costUtils';
import { formatDate, createTodayWithDay, createDateInTimezone, parseDateComponents } from '../../utils/dateUtils';
import { validateExpenseForm } from '../../utils/formValidation';

// Offline storage keys
const STORAGE_KEYS = {
    EXPENSES: 'offline_expenses',
    CATEGORIES: 'offline_categories',
} as const;

// Offline expense interface
interface OfflineExpense {
    id: string;
    amount: number;
    description: string;
    date: string;
    categoryId: string;
    categoryName: string;
    userId: string;
    synced: boolean;
    created_at: string;
    updated_at: string;
    originalId?: string; // For tracking updates to existing online expenses
    operation?: 'create' | 'update' | 'delete'; // Track the type of operation
}

// Constants
const RECENT_EXPENSES_LIMIT = 10;
const SUCCESS_MESSAGES = {
    EXPENSE_ADDED: 'Expense added successfully',
    EXPENSE_UPDATED: 'Expense updated successfully',
    EXPENSE_DELETED: 'Expense deleted successfully'
} as const;

const ERROR_MESSAGES = {
    USER_NOT_FOUND: 'User not found. Please login again.',
    CATEGORY_NOT_FOUND: 'Selected category not found',
    UNABLE_TO_UPDATE: 'Unable to update expense',
    FAILED_TO_ADD: 'Failed to add expense. Please try again.',
    FAILED_TO_UPDATE: 'Failed to update expense. Please try again.',
    FAILED_TO_DELETE: 'Failed to delete expense. Please try again.',
    FAILED_TO_LOAD: 'Failed to load data. Please try again.'
} as const;

// Helper functions for offline storage
const getStoredExpenses = async (): Promise<OfflineExpense[]> => {
    try {
        const storedExpenses = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
        return storedExpenses ? JSON.parse(storedExpenses) : [];
    } catch (error) {
        console.error('Error getting stored expenses:', error);
        return [];
    }
};

const saveStoredExpenses = async (expenses: OfflineExpense[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (error) {
        console.error('Error saving stored expenses:', error);
    }
};

export const ExpenseScreen = ({ navigation }: { navigation: any }) => {
    const { user } = useAuthStore();
    const {
        getCurrentMonthExpenses,
        isLoadingMonth,
        currentMonth,
        currentYear,
        getCategoryIcon,
        updateCurrentDate,
    } = useExpenseStore();
    
    // Offline state
    const [offlineExpenses, setOfflineExpenses] = useState<OfflineExpense[]>([]);
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [unsyncedCount, setUnsyncedCount] = useState(0);
    
    // Form state
    const [notes, setNotes] = useState('');
    const [cost, setCost] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    
    // Modal state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editFormData, setEditFormData] = useState({ cost: '', notes: '', category: '', day: '' });
    
    // UI state
    const [showExpenseDetails, setShowExpenseDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Ref to track last sync time to prevent rapid consecutive syncs
    const lastSyncTimeRef = useRef<number>(0);

    // Always use current month/year - these values update automatically when date changes
    const isLoadingExpenses = isLoadingMonth(currentYear, currentMonth);
    
    // Get categories and recent expenses from store (will update when data changes)
    const categories = useExpenseStore(state => state.categories);
    const onlineExpenses = useExpenseStore(state => state.getRecentExpenses(RECENT_EXPENSES_LIMIT));
    const currentMonthTotal = useExpenseStore(state => state.getCurrentMonthTotal());
    
    // Simple combined expenses calculation
    const combinedExpenses = useMemo(() => {
        // Get unsynced offline expenses (excluding delete operations)
        const unsyncedOfflineExpenses = offlineExpenses.filter(exp => !exp.synced && exp.operation !== 'delete');
        
        // Get IDs of online expenses that have pending delete operations
        const pendingDeleteIds = new Set(
            offlineExpenses
                .filter(exp => !exp.synced && exp.operation === 'delete' && exp.originalId)
                .map(exp => exp.originalId!)
        );
        
        // Filter out online expenses that have pending delete operations
        const filteredOnlineExpenses = onlineExpenses.filter(exp => !pendingDeleteIds.has(exp.id));
        
        // Transform offline expenses to match online format
        const transformedOfflineExpenses = unsyncedOfflineExpenses.map(exp => ({
            id: exp.id,
            amount: exp.amount,
            description: exp.description,
            category: exp.categoryName,
            categoryId: exp.categoryId,
            date: exp.date,
            time: '00:00'
        }));
        
        // Combine and limit to recent expenses
        const combined = [...filteredOnlineExpenses, ...transformedOfflineExpenses];
        return combined.slice(0, RECENT_EXPENSES_LIMIT);
    }, [onlineExpenses, offlineExpenses]);
    
    // Simple total calculation
    const combinedTotal = useMemo(() => {
        // Add unsynced offline expenses (excluding delete operations)
        const unsyncedOfflineTotal = offlineExpenses
            .filter(exp => !exp.synced && exp.operation !== 'delete')
            .reduce((sum, exp) => sum + exp.amount, 0);
            
        // Subtract amounts for expenses pending deletion
        const pendingDeleteTotal = offlineExpenses
            .filter(exp => !exp.synced && exp.operation === 'delete')
            .reduce((sum, exp) => {
                // Find the original expense to get its amount
                const originalExpense = onlineExpenses.find(e => e.id === exp.originalId);
                return sum + (originalExpense?.amount || 0);
            }, 0);
            
        return currentMonthTotal + unsyncedOfflineTotal - pendingDeleteTotal;
    }, [currentMonthTotal, offlineExpenses, onlineExpenses]);

    // Load data and setup network monitoring
    useEffect(() => {
        if (!user?.id) return;
        
        const loadData = async () => {
            try {
                // Ensure we're using the current month/year
                updateCurrentDate();
                
                // Load online data from the existing expense store
                const expenseStore = useExpenseStore.getState();
                await Promise.all([
                    expenseStore.loadExpensesForMonth(user.id, currentYear, currentMonth),
                    expenseStore.loadCategories(user.id)
                ]);
                
                // Save categories offline for future use
                await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(expenseStore.categories));
                
            } catch (error) {
                console.error('Error loading initial data:', error);
                Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_LOAD);
            }
        };
        
        // Load data
        loadData();
        
        // Check initial network state
        NetInfo.fetch().then(state => {
            const online = state.isConnected === true && state.isInternetReachable === true;
            setIsOnline(online);
        });
    }, [user?.id, currentYear, currentMonth, updateCurrentDate]);

    // Network status monitoring
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const online = state.isConnected === true && state.isInternetReachable === true;
            setIsOnline(online);
        });

        return unsubscribe;
    }, []);

    // Load offline data on mount
    const loadOfflineData = useCallback(async () => {
        const expenses = await getStoredExpenses();
        
        // Filter for current month
        const currentMonthExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getFullYear() === currentYear && expDate.getMonth() + 1 === currentMonth;
        });
        
        setOfflineExpenses(currentMonthExpenses);
        setUnsyncedCount(expenses.filter(exp => !exp.synced).length);
    }, [currentYear, currentMonth]);

    // Load offline data when month changes
    useEffect(() => {
        loadOfflineData();
    }, [loadOfflineData]);

    // Save expense offline
    const saveExpenseOffline = useCallback(async (expense: OfflineExpense) => {
        const expenses = await getStoredExpenses();
        
        const existingIndex = expenses.findIndex(e => e.id === expense.id);
        if (existingIndex >= 0) {
            expenses[existingIndex] = expense;
        } else {
            expenses.unshift(expense); // Add to beginning
        }
        
        await saveStoredExpenses(expenses);
        await loadOfflineData(); // Refresh display
    }, [loadOfflineData]);

    // Sync offline expenses to server
    const syncOfflineExpenses = useCallback(async () => {
        if (!user?.id || isSyncing || !isOnline) {
            return;
        }
        
        // Prevent rapid consecutive syncs (minimum 5 seconds between syncs)
        const now = Date.now();
        if (now - lastSyncTimeRef.current < 5000) {
            return;
        }
        lastSyncTimeRef.current = now;
        
        setIsSyncing(true);
        try {
            const expenses = await getStoredExpenses();
            const unsyncedExpenses = expenses.filter(exp => !exp.synced && exp.userId === user.id);
            
            if (unsyncedExpenses.length === 0) {
                return;
            }

            const expenseStore = useExpenseStore.getState();
            let syncedCount = 0;
            const failedExpenseIds: string[] = [];
            
            // Try to sync each expense to server based on operation type
            for (const expense of unsyncedExpenses) {
                try {
                    const operation = expense.operation || 'create';
                    
                    switch (operation) {
                        case 'create':
                            await expenseStore.addExpense(user.id, {
                                category_id: parseInt(expense.categoryId),
                                cost: expense.amount.toString(),
                                notes: expense.description,
                                expense_date: expense.date
                            });
                            break;
                            
                        case 'update':
                            if (expense.originalId) {
                                await expenseStore.updateExpense(user.id, expense.originalId, {
                                    category_id: parseInt(expense.categoryId),
                                    cost: expense.amount.toString(),
                                    notes: expense.description,
                                    expense_date: expense.date
                                });
                            }
                            break;
                            
                        case 'delete':
                            if (expense.originalId) {
                                await expenseStore.deleteExpense(user.id, expense.originalId);
                            }
                            break;
                    }
                    
                    syncedCount++;
                } catch (error) {
                    console.error(`Failed to sync ${expense.operation || 'create'} operation for expense ${expense.id}:`, error);
                    failedExpenseIds.push(expense.id);
                }
            }
            
            // Only remove successfully synced expenses from offline storage
            if (syncedCount > 0) {
                const currentExpenses = await getStoredExpenses();
                const remainingExpenses = currentExpenses.filter(exp => {
                    // Keep expenses that are already synced, belong to other users, or failed to sync
                    return exp.synced || exp.userId !== user.id || failedExpenseIds.includes(exp.id);
                });
                
                await saveStoredExpenses(remainingExpenses);
                await loadOfflineData();
                
                // Refresh online data
                await expenseStore.loadExpensesForMonth(user.id, currentYear, currentMonth);
            }
            
            if (syncedCount > 0) {
                Alert.alert('Sync Complete', `${syncedCount} expense${syncedCount !== 1 ? 's' : ''} synced successfully`);
            }
            
            if (failedExpenseIds.length > 0) {
                Alert.alert('Partial Sync', `${syncedCount} expenses synced successfully. ${failedExpenseIds.length} failed and will be retried later.`);
            }
            
        } catch (error) {
            console.error('Sync failed:', error);
            Alert.alert('Sync Failed', 'Unable to sync expenses. Please try again.');
        } finally {
            setIsSyncing(false);
        }
    }, [user?.id, isSyncing, isOnline, currentYear, currentMonth]);

    const resetForm = useCallback(() => {
        setNotes('');
        setCost('');
        setSelectedCategory('');
    }, []);

    const resetEditForm = useCallback(() => {
        setEditingId(null);
        setEditModalVisible(false);
        setEditFormData({ cost: '', notes: '', category: '', day: '' });
    }, []);

    const handleAddExpense = useCallback(async () => {
        // Check if categories are loaded
        if (categories.length === 0) {
            Alert.alert('Please Wait', 'Categories are still loading. Please try again in a moment.');
            return;
        }
        
        const validationError = validateExpenseForm(cost, notes, selectedCategory, user?.id);
        if (validationError) {
            Alert.alert('Missing Information', validationError);
            return;
        }

        setIsLoading(true);
        
        try {
            const categoryObj = categories.find(cat => cat.id === selectedCategory);
            if (!categoryObj) {
                Alert.alert('Error', ERROR_MESSAGES.CATEGORY_NOT_FOUND);
                return;
            }

            // Use full ISO string for expense_date
            const expenseDate = new Date().toISOString();

            // Create offline expense first (instant response)
            const offlineExpense: OfflineExpense = {
                id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                amount: parseFloat(cost),
                description: notes,
                date: expenseDate, // <-- now includes time
                categoryId: selectedCategory,
                categoryName: categoryObj.name,
                userId: user!.id,
                synced: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                operation: 'create'
            };

            // Try to sync immediately if online, otherwise save offline
            if (isOnline) {
                try {
                    const expenseStore = useExpenseStore.getState();
                    await expenseStore.addExpense(user!.id, {
                        category_id: parseInt(categoryObj.id),
                        cost: cost.trim(),
                        notes: notes.trim(),
                        expense_date: expenseDate
                    });
                    
                    // Refresh online data
                    await expenseStore.loadExpensesForMonth(user!.id, currentYear, currentMonth);
                    
                    // Success - show message and reset form
                    resetForm();
                    Alert.alert('Success', SUCCESS_MESSAGES.EXPENSE_ADDED);
                } catch (error) {
                    console.error('Failed to sync immediately:', error);
                    // If online sync fails, save offline as fallback
                    await saveExpenseOffline(offlineExpense);
                    resetForm();
                    Alert.alert('Success', SUCCESS_MESSAGES.EXPENSE_ADDED + ' (Saved offline)');
                }
            } else {
                // If offline, save to local storage
                await saveExpenseOffline(offlineExpense);
                resetForm();
                Alert.alert('Success', SUCCESS_MESSAGES.EXPENSE_ADDED + ' (Offline)');
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_ADD);
        } finally {
            setIsLoading(false);
        }
    }, [cost, notes, selectedCategory, user, categories, currentYear, currentMonth, isOnline]);

    const handleEditExpense = useCallback((expense: any) => {
        try {
            // Use categoryId for reliable category lookup
            const categoryObj = categories.find(cat => cat.id === expense.categoryId);
            const { day } = parseDateComponents(expense.date);
            setEditFormData({
                cost: expense.amount.toString(),
                notes: expense.description || '',
                category: categoryObj?.id || '',
                day: day.toString()
            });
            setEditingId(expense.id);
            setEditModalVisible(true);
        } catch (error) {
            console.error('Error preparing expense for editing:', error);
            Alert.alert('Error', 'Unable to edit this expense. Please try again.');
        }
    }, [categories]);

    const handleUpdateExpense = useCallback(async () => {
        const validationError = validateExpenseForm(editFormData.cost, editFormData.notes, editFormData.category, user?.id);
        if (validationError || !editingId) {
            Alert.alert('Error', validationError || ERROR_MESSAGES.UNABLE_TO_UPDATE);
            return;
        }

        // Validate day selection
        if (!editFormData.day || isNaN(parseInt(editFormData.day)) || parseInt(editFormData.day) < 1 || parseInt(editFormData.day) > 31) {
            Alert.alert('Missing Information', 'Please select a valid day for the expense');
            return;
        }

        try {
            const categoryObj = categories.find(cat => cat.id === editFormData.category);
            if (!categoryObj) {
                Alert.alert('Error', ERROR_MESSAGES.CATEGORY_NOT_FOUND);
                return;
            }

            // Get original expense to preserve month/year
            const currentExpenses = getCurrentMonthExpenses();
            const originalExpense = currentExpenses.find(exp => exp.id === editingId);
            
            // Create expense date using original month/year and selected day in Asia/Manila timezone
            let expenseDate: string;
            if (originalExpense) {
                // If original expense has a time, preserve it
                const originalDate = new Date(originalExpense.date);
                const year = originalDate.getFullYear();
                const month = originalDate.getMonth();
                const day = parseInt(editFormData.day);
                // Set the time to the original time
                originalDate.setFullYear(year, month, day);
                expenseDate = originalDate.toISOString();
            } else {
                // Fallback to current date and time if original expense not found
                expenseDate = new Date().toISOString();
            }

            // Check if this is an offline expense
            const isOfflineExpense = editingId.startsWith('offline_');
            
            if (isOfflineExpense) {
                // Update offline expense directly
                const updatedOfflineExpense: OfflineExpense = {
                    id: editingId,
                    amount: parseFloat(editFormData.cost),
                    description: editFormData.notes.trim(),
                    date: expenseDate,
                    categoryId: editFormData.category,
                    categoryName: categoryObj.name,
                    userId: user!.id,
                    synced: false,
                    created_at: new Date().toISOString(), // Keep original created_at if you have it
                    updated_at: new Date().toISOString(),
                    operation: 'update'
                };

                // Save offline first (instant response)
                await saveExpenseOffline(updatedOfflineExpense);
                Alert.alert('Success', SUCCESS_MESSAGES.EXPENSE_UPDATED);
                resetEditForm();

                // Try to sync immediately if online
                if (isOnline) {
                    await syncOfflineExpenses();
                }
            } else {
                // For online expenses, try to update online first
                if (isOnline) {
                    try {
                        const expenseStore = useExpenseStore.getState();
                        await expenseStore.updateExpense(user!.id, editingId, {
                            category_id: parseInt(categoryObj.id),
                            cost: editFormData.cost.trim(),
                            notes: editFormData.notes.trim(),
                            expense_date: expenseDate
                        });
                        
                        // Refresh data
                        await expenseStore.loadExpensesForMonth(user!.id, currentYear, currentMonth);
                        
                        Alert.alert('Success', SUCCESS_MESSAGES.EXPENSE_UPDATED);
                        resetEditForm();
                    } catch (error) {
                        console.error('Error updating expense online:', error);
                        Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_UPDATE);
                    }
                } else {
                    // If offline, create an offline update operation
                    const offlineUpdateExpense: OfflineExpense = {
                        id: `offline_update_${editingId}_${Date.now()}`,
                        amount: parseFloat(editFormData.cost),
                        description: editFormData.notes.trim(),
                        date: expenseDate,
                        categoryId: editFormData.category,
                        categoryName: categoryObj.name,
                        userId: user!.id,
                        synced: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        originalId: editingId,
                        operation: 'update'
                    };

                    await saveExpenseOffline(offlineUpdateExpense);
                    Alert.alert('Success', SUCCESS_MESSAGES.EXPENSE_UPDATED + ' (Will sync when online)');
                    resetEditForm();
                }
            }
        } catch (error) {
            console.error('Error updating expense:', error);
            Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_UPDATE);
        }
    }, [editFormData, editingId, user, categories, currentYear, currentMonth, isOnline]);
    
    const handleDeleteExpense = useCallback(async (id: string) => {
        if (!user?.id) {
            Alert.alert('Error', ERROR_MESSAGES.USER_NOT_FOUND);
            return;
        }

        Alert.alert(
            'Delete Expense',
            'Are you sure you want to delete this expense?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const isOfflineExpense = id.startsWith('offline_');
                            
                            if (isOfflineExpense) {
                                // Delete from offline storage
                                const expenses = await getStoredExpenses();
                                const filteredExpenses = expenses.filter(exp => exp.id !== id);
                                await saveStoredExpenses(filteredExpenses);
                                await loadOfflineData(); // Refresh display
                                
                                Alert.alert('Success', SUCCESS_MESSAGES.EXPENSE_DELETED);
                            } else {
                                // For online expenses, try to delete online first
                                if (isOnline) {
                                    try {
                                        const expenseStore = useExpenseStore.getState();
                                        await expenseStore.deleteExpense(user.id, id);
                                        
                                        // Refresh data
                                        await expenseStore.loadExpensesForMonth(user.id, currentYear, currentMonth);
                                        
                                        Alert.alert('Success', SUCCESS_MESSAGES.EXPENSE_DELETED);
                                    } catch (error) {
                                        console.error('Error deleting expense online:', error);
                                        Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_DELETE);
                                    }
                                } else {
                                    // If offline, create a delete operation for later sync
                                    const deleteOperation: OfflineExpense = {
                                        id: `offline_delete_${id}_${Date.now()}`,
                                        amount: 0, // Not relevant for delete operations
                                        description: 'DELETE OPERATION',
                                        date: new Date().toISOString(),
                                        categoryId: '',
                                        categoryName: '',
                                        userId: user.id,
                                        synced: false,
                                        created_at: new Date().toISOString(),
                                        updated_at: new Date().toISOString(),
                                        originalId: id,
                                        operation: 'delete'
                                    };
                                    
                                    await saveExpenseOffline(deleteOperation);
                                    Alert.alert('Success', SUCCESS_MESSAGES.EXPENSE_DELETED + ' (Will sync when online)');
                                }
                            }
                        } catch (error) {
                            console.error('Error deleting expense:', error);
                            Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_DELETE);
                        }
                    }
                }
            ]
        );
    }, [user, currentYear, currentMonth, isOnline]);

    const cancelEdit = () => {
        resetEditForm();
    };    

    const updateEditFormField = useCallback((field: string, value: string) => {
        if (field === 'cost') {
            setEditFormData(prev => ({ ...prev, [field]: formatCostInput(value) }));
        } else {
            setEditFormData(prev => ({ ...prev, [field]: value }));
        }
    }, []);

    const handleCostChange = useCallback((value: string) => {
        setCost(formatCostInput(value));
    }, []);

    const formatDateForDisplay = useCallback((dateString: string) => {
        return formatDate(dateString);
    }, []);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Add Expense</Text>
                <Text style={styles.subtitle}>Quick and easy expense tracking</Text>
            </View>

            {/* Quick Add Form */}
            <View style={styles.quickAddForm}>
                <View style={styles.formRow}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Cost</Text>
                        <TextInput
                            style={styles.costInput}
                            placeholder="0.00"
                            value={cost}
                            onChangeText={handleCostChange}
                            keyboardType="numeric"
                            placeholderTextColor="#94a3b8"
                            autoFocus={true}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 2 }]}>
                        <Text style={styles.inputLabel}>Notes</Text>
                        <TextInput
                            style={styles.notesInput}
                            value={notes}
                            onChangeText={setNotes}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                </View>

                <View style={styles.categorySection}>
                    <Text style={styles.inputLabel}>Select Category</Text>
                    <Text style={styles.helperText}>Slide to see more categories</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                        {categories.length > 0 ? categories.map((category) => (
                            <CategoryChip
                                key={category.id}
                                category={category.name}
                                isSelected={selectedCategory === category.id}
                                onPress={() => setSelectedCategory(category.id)}
                                getCategoryIcon={getCategoryIcon}
                                color="#3b82f6"
                            />
                        )) : (
                            <View style={styles.loadingCategoriesContainer}>
                                <ActivityIndicator size="small" color="#3b82f6" />
                                <Text style={styles.loadingCategoriesText}>Loading categories...</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>



                <TouchableOpacity 
                    style={[
                        styles.quickAddButton, 
                        (isLoading || categories.length === 0) && styles.quickAddButtonDisabled
                    ]} 
                    onPress={handleAddExpense}
                    disabled={isLoading || categories.length === 0}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : categories.length === 0 ? (
                        <Text style={styles.quickAddButtonTextDisabled}>Loading...</Text>
                    ) : (
                        <Text style={styles.quickAddButtonText}>+ Add Expense</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Offline Status and Sync Section */}
            {(unsyncedCount > 0 || !isOnline) && (
                <View style={styles.syncStatusCard}>
                    <View style={styles.syncStatusHeader}>
                        <View style={styles.statusIndicator}>
                            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10b981' : '#f59e0b' }]} />
                            <Text style={styles.statusText}>
                                {isOnline ? 'Online' : 'Offline'}
                            </Text>
                        </View>
                        {unsyncedCount > 0 && (
                            <TouchableOpacity 
                                style={[
                                    styles.syncButton, 
                                    (isSyncing || !isOnline) && styles.syncButtonDisabled
                                ]} 
                                onPress={syncOfflineExpenses}
                                disabled={isSyncing || !isOnline}
                            >
                                {isSyncing ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text style={[
                                        styles.syncButtonText,
                                        !isOnline && styles.syncButtonTextDisabled
                                    ]}>
                                        Sync Now
                                    </Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                    {unsyncedCount > 0 && (
                        <>
                            <Text style={styles.unsyncedText}>
                                {unsyncedCount} operation{unsyncedCount !== 1 ? 's' : ''} pending sync
                            </Text>
                            <Text style={styles.syncHelperText}>
                                {isOnline 
                                    ? 'Tap "Sync Now" to upload your offline changes to the server.' 
                                    : 'Connect to the internet to sync your offline changes.'
                                }
                            </Text>
                        </>
                    )}
                </View>
            )}

            {/* Toggle Button for Expense Details - Only show when details are hidden */}
            {!showExpenseDetails && (
                <View style={styles.toggleSection}>
                    <TouchableOpacity 
                        style={styles.toggleButton} 
                        onPress={() => setShowExpenseDetails(!showExpenseDetails)}
                    >
                        <Text style={styles.toggleButtonText}>
                            View Expense Details
                        </Text>
                        <Text style={styles.toggleIcon}>
                            ▼
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Collapsible Expense Details */}
            {showExpenseDetails && (
                <>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Total Expenses This Month</Text>
                        {isSyncing ? (
                            <View style={styles.syncingTotalContainer}>
                                <ActivityIndicator size="small" color="#3b82f6" />
                                <Text style={styles.syncingTotalText}>Syncing...</Text>
                            </View>
                        ) : (
                            <Text style={styles.summaryAmount}>-{combinedTotal.toFixed(2)}</Text>
                        )}
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Expenses</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('AllExpenses')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoadingExpenses ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#3b82f6" />
                            <Text style={styles.loadingText}>Loading expenses...</Text>
                        </View>
                    ) : combinedExpenses.length > 0 ? (
                        combinedExpenses.map((item) => (
                            <ExpenseItem
                                key={item.id}
                                item={item}
                                getCategoryIcon={getCategoryIcon}
                                formatDate={formatDateForDisplay}
                                onEdit={handleEditExpense}
                                onDelete={handleDeleteExpense}
                                editable={true}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No expenses found</Text>
                            <Text style={styles.emptySubtext}>Add your first expense above</Text>
                        </View>
                    )}

                    {/* Hide Button at the bottom when details are shown */}
                    <View style={styles.hideSection}>
                        <TouchableOpacity 
                            style={styles.hideButton} 
                            onPress={() => setShowExpenseDetails(false)}
                        >
                            <Text style={styles.hideButtonText}>
                                Hide Expense Details
                            </Text>
                            <Text style={styles.hideIcon}>
                                ▲
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {/* Edit Expense Modal */}
            <Modal
                visible={editModalVisible}
                transparent={true}
                animationType="none"
                onRequestClose={cancelEdit}
            >
                <View style={styles.editModalOverlay}>
                    <View style={styles.editModalContainer}>
                        <View style={styles.editModalHeader}>
                            <Text style={styles.editModalTitle}>Edit Expense</Text>
                            <TouchableOpacity onPress={cancelEdit} style={styles.editModalCloseButton}>
                                <Text style={styles.editModalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.editFormRow}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Cost</Text>
                                <TextInput
                                    style={styles.costInput}
                                    placeholder="0.00"
                                    value={editFormData.cost}
                                    onChangeText={(text) => updateEditFormField('cost', text)}
                                    keyboardType="numeric"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 2 }]}>
                                <Text style={styles.inputLabel}>Notes</Text>
                                <TextInput
                                    style={styles.notesInput}
                                    placeholder="What did you buy?"
                                    value={editFormData.notes}
                                    onChangeText={(text) => updateEditFormField('notes', text)}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                        </View>

                        <View style={styles.categorySection}>
                            <Text style={styles.inputLabel}>Select Category</Text>
                            <Text style={styles.helperText}>Slide to see more categories</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                                {categories.map((category) => (
                                    <CategoryChip
                                        key={category.id}
                                        category={category.name}
                                        isSelected={editFormData.category === category.id}
                                        onPress={() => setEditFormData(prev => ({ ...prev, category: category.id }))}
                                        getCategoryIcon={getCategoryIcon}
                                        color="#3b82f6"
                                    />
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.daySection}>
                            <Text style={styles.inputLabel}>Day</Text>
                            <Text style={styles.helperText}>Select the day of the month for this expense</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                    <TouchableOpacity
                                        key={day}
                                        style={[
                                            styles.dayChip,
                                            editFormData.day === day.toString() && styles.dayChipSelected
                                        ]}
                                        onPress={() => setEditFormData(prev => ({ ...prev, day: day.toString() }))}
                                    >
                                        <Text style={[
                                            styles.dayChipText,
                                            editFormData.day === day.toString() && styles.dayChipTextSelected
                                        ]}>
                                            {day}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.editModalButtons}>
                            <TouchableOpacity style={styles.editCancelButton} onPress={cancelEdit}>
                                <Text style={styles.editCancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.editUpdateButton} onPress={handleUpdateExpense}>
                                <Text style={styles.editUpdateButtonText}>Update Expense</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 24,
        paddingBottom: 32,
        backgroundColor: '#3b82f6',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#e0e7ff',
        opacity: 0.9,
    },
    summaryCard: {
        backgroundColor: 'white',
        margin: 16,
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 8,
        fontWeight: '500',
    },
    summaryAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ef4444',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    seeAllText: {
        fontSize: 14,
        color: '#3b82f6',
        fontWeight: '500',
    },
    quickAddForm: {
        backgroundColor: 'white',
        margin: 16,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    formRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    inputGroup: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
    },
    costInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9fafb',
    },
    notesInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9fafb',
    },
    categorySection: {
        marginBottom: 16,
    },
    daySection: {
        marginBottom: 20,
    },
    helperText: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 4,
        fontStyle: 'italic',
    },
    categoryScroll: {
        marginTop: 8,
    },
    dayScroll: {
        marginBottom: 12,
    },
    quickAddButton: {
        backgroundColor: '#3b82f6',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    quickAddButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    quickAddButtonDisabled: {
        backgroundColor: '#9ca3af',
        opacity: 0.7,
    },
    quickAddButtonTextDisabled: {
        color: '#d1d5db',
        fontSize: 14,
        fontWeight: '600',
    },
    editModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    editModalContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 16,
    },
    editModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    editModalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1e293b',
    },
    editModalCloseButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
    },
    editModalCloseText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: 'bold',
    },
    editFormRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    editModalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    editCancelButton: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    editCancelButtonText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '600',
    },
    editUpdateButton: {
        flex: 1,
        backgroundColor: '#3b82f6',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    editUpdateButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    toggleSection: {
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
    },
    toggleButton: {
        backgroundColor: '#f8fafc',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    toggleButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
        marginRight: 8,
    },
    toggleIcon: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: 'normal',
    },
    hideSection: {
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 20,
    },
    hideButton: {
        backgroundColor: '#f8fafc',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    hideButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
        marginRight: 8,
    },
    hideIcon: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: 'bold',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748b',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
    },
    dayChip: {
        backgroundColor: '#e0f2fe',
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#3b82f6',
    },
    dayChipSelected: {
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
    },
    dayChipText: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '500',
    },
    dayChipTextSelected: {
        color: 'white',
        fontWeight: 'bold',
    },
    syncStatusCard: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    syncStatusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    syncButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
    },
    syncButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    syncButtonDisabled: {
        backgroundColor: '#9ca3af',
        opacity: 0.7,
    },
    syncButtonTextDisabled: {
        color: '#d1d5db',
    },
    syncingTotalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    syncingTotalText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#3b82f6',
    },
    loadingCategoriesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    loadingCategoriesText: {
        fontSize: 14,
        color: '#6b7280',
        fontStyle: 'italic',
    },
    unsyncedText: {
        fontSize: 12,
        color: '#6b7280',
        fontStyle: 'italic',
    },
    syncHelperText: {
        fontSize: 11,
        color: '#9ca3b8',
        marginTop: 4,
        textAlign: 'center',
        lineHeight: 14,
    },
});
