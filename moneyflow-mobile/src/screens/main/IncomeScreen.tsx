import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Alert, ActivityIndicator, AppState, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useAuthStore } from '../../store/authStore';
import { useIncomeStore } from '../../store/incomeStore';
import { formatCostInput } from '../../utils/costUtils';
import { parseDateComponents, formatDate } from '../../utils/dateUtils';
import { validateExpenseForm } from '../../utils/formValidation';
import { IncomeItem } from '../../components/IncomeItem';
import { CategoryChip } from '../../components/CategoryChip';
import { MainScreenHeader } from '@/components/MainScreenHeader';

// Offline storage keys
const STORAGE_KEYS = {
    INCOMES: 'offline_incomes',
    CATEGORIES: 'offline_categories',
} as const;

// Offline income interface
interface OfflineIncome {
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
    originalId?: string; // For tracking updates to existing online incomes
    operation?: 'create' | 'update' | 'delete'; // Track the type of operation
}

interface Category {
    id: string;
    name: string;
    icon: string;
    enabled: boolean;
    type: 'INCOME' | 'EXPENSE';
}

// Constants
const RECENT_INCOMES_LIMIT = 10;
const SUCCESS_MESSAGES = {
    INCOME_ADDED: 'Income added successfully',
    INCOME_UPDATED: 'Income updated successfully',
    INCOME_DELETED: 'Income deleted successfully'
} as const;

const ERROR_MESSAGES = {
    USER_NOT_FOUND: 'User not found. Please login again.',
    CATEGORY_NOT_FOUND: 'Selected category not found',
    UNABLE_TO_UPDATE: 'Unable to update income',
    FAILED_TO_ADD: 'Failed to add income. Please try again.',
    FAILED_TO_UPDATE: 'Failed to update income. Please try again.',
    FAILED_TO_DELETE: 'Failed to delete income. Please try again.',
    FAILED_TO_LOAD: 'Failed to load data. Please try again.'
} as const;

// Helper functions for offline storage
const getStoredIncomes = async (): Promise<OfflineIncome[]> => {
    try {
        const storedIncomes = await AsyncStorage.getItem(STORAGE_KEYS.INCOMES);
        return storedIncomes ? JSON.parse(storedIncomes) : [];
    } catch (error) {
        console.error('Error getting stored incomes:', error);
        return [];
    }
};

const saveStoredIncomes = async (incomes: OfflineIncome[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
    } catch (error) {
        console.error('Error saving stored incomes:', error);
    }
};

export const IncomeScreen = ({ navigation }: { navigation: any }) => {
    const { user } = useAuthStore();
    const {
        getCurrentMonthIncomes,
        isLoadingMonth,
        currentMonth,
        currentYear,
        getCategoryIcon,
        updateCurrentDate,
    } = useIncomeStore();
    
    // Offline state
    const [offlineIncomes, setOfflineIncomes] = useState<OfflineIncome[]>([]);
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [unsyncedCount, setUnsyncedCount] = useState(0);
    
    // Form state
    const [notes, setNotes] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const resetForm = useCallback(() => {
        setAmount('');
        setNotes('');
        setSelectedCategory(null);
    }, []);

    const validateIncomeForm = (amount: string, notes: string, selectedCategory: string | null, userId?: string) => {
        if (!amount || !notes || !selectedCategory || !userId) {
            return 'All fields are required.';
        }
        if (isNaN(Number(amount)) || Number(amount) <= 0) {
            return 'Amount must be a valid number.';
        }
        return null;
    };

    // Modal state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editFormData, setEditFormData] = useState({ amount: '', notes: '', category: '', day: '' });
    
    // UI state
    const [showIncomeDetails, setShowIncomeDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Ref to track last sync time to prevent rapid consecutive syncs
    const lastSyncTimeRef = useRef<number>(0);

    // Always use current month/year - these values update automatically when date changes
    const isLoadingIncomes = isLoadingMonth(currentYear, currentMonth);
    
    // Get categories and recent incomes from store (will update when data changes)
    const [enabledCategoryIds, setEnabledCategoryIds] = useState<string[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const onlineIncomes = useIncomeStore(state => state.getRecentIncomes(RECENT_INCOMES_LIMIT));
    const currentMonthTotal = useIncomeStore(state => state.getCurrentMonthTotal());
    
    // Simple combined incomes calculation
    const combinedIncomes = useMemo(() => {
        // Get unsynced offline incomes (excluding delete operations)
        const unsyncedOfflineIncomes = offlineIncomes.filter(inc => !inc.synced && inc.operation !== 'delete');
        
        // Get IDs of online incomes that have pending delete operations
        const pendingDeleteIds = new Set(
            offlineIncomes
                .filter(inc => !inc.synced && inc.operation === 'delete' && inc.originalId)
                .map(inc => inc.originalId!)
        );
        
        // Filter out online incomes that have pending delete operations
        const filteredOnlineIncomes = onlineIncomes.filter(inc => !pendingDeleteIds.has(inc.id));
        
        // Transform offline incomes to match online format
        const transformedOfflineIncomes = unsyncedOfflineIncomes.map(inc => ({
            id: inc.id,
            amount: inc.amount,
            description: inc.description,
            category: inc.categoryName,
            categoryId: inc.categoryId,
            date: inc.date,
            time: '00:00'
        }));
        
        // Combine and limit to recent incomes
        const combined = [...filteredOnlineIncomes, ...transformedOfflineIncomes];
        return combined.slice(0, RECENT_INCOMES_LIMIT);
    }, [onlineIncomes, offlineIncomes]);
    
    // Simple total calculation
    const combinedTotal = useMemo(() => {
        // Add unsynced offline incomes (excluding delete operations)
        const unsyncedOfflineTotal = offlineIncomes
            .filter(inc => !inc.synced && inc.operation !== 'delete')
            .reduce((sum, inc) => sum + inc.amount, 0);
            
        // Subtract amounts for incomes pending deletion
        const pendingDeleteTotal = offlineIncomes
            .filter(inc => !inc.synced && inc.operation === 'delete')
            .reduce((sum, inc) => {
                // Find the original income to get its amount
                const originalIncome = onlineIncomes.find(e => e.id === inc.originalId);
                return sum + (originalIncome?.amount || 0);
            }, 0);
            
        return currentMonthTotal + unsyncedOfflineTotal - pendingDeleteTotal;
    }, [currentMonthTotal, offlineIncomes, onlineIncomes]);

    // Load data and setup network monitoring
    useEffect(() => {
        if (!user?.id) return;
        
        const loadData = async () => {
            try {
                setIsLoading(true);
                await Promise.all([
                    useIncomeStore.getState().loadIncomesForMonth(user.id, currentYear, currentMonth),
                    useIncomeStore.getState().loadCategories(user.id)
                ]);
            } catch (error) {
                Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_LOAD);
            } finally {
                setIsLoading(false);
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
        const incomes = await getStoredIncomes();
        
        // Filter for current month
        const currentMonthIncomes = incomes.filter(inc => {
            const incDate = new Date(inc.date);
            return incDate.getFullYear() === currentYear && incDate.getMonth() + 1 === currentMonth;
        });
        
        setOfflineIncomes(currentMonthIncomes);
        setUnsyncedCount(incomes.filter(inc => !inc.synced).length);
    }, [currentYear, currentMonth]);

    // Load offline data when month changes
    useEffect(() => {
        loadOfflineData();
    }, [loadOfflineData]);

    // Save income offline
    const saveIncomeOffline = useCallback(async (income: OfflineIncome) => {
        const incomes = await getStoredIncomes();
        
        const existingIndex = incomes.findIndex(e => e.id === income.id);
        if (existingIndex >= 0) {
            incomes[existingIndex] = income;
        } else {
            incomes.unshift(income); // Add to beginning
        }
        
        await saveStoredIncomes(incomes);
        await loadOfflineData(); // Refresh display
    }, [loadOfflineData]);

    // Simplified sync: only reference unsynced state in local DB
    const syncOfflineIncomes = useCallback(async () => {
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
            let incomes = await getStoredIncomes();
            // Only unsynced incomes for this user
            let unsyncedIncomes = incomes.filter(inc => !inc.synced && inc.userId === user.id);
            if (unsyncedIncomes.length === 0) {
                setIsSyncing(false);
                return;
            }
            const incomeStore = useIncomeStore.getState();
            let syncedCount = 0;
            const failedIncomeIds: string[] = [];
            // Sync each unsynced income based on its state
            for (const income of unsyncedIncomes) {
                try {
                    const payload = {
                        category_id: parseInt(income.categoryId),
                        amount: income.amount.toString().trim(),
                        notes: income.description ? income.description.trim() : '',
                        income_date: income.date
                    };
                    if (income.operation === 'delete' && income.originalId) {
                        // Delete in backend
                        await incomeStore.deleteIncome(user.id, income.originalId);
                    } else if (income.originalId) {
                        // Update in backend
                        await incomeStore.updateIncome(user.id, income.originalId, payload);
                    } else {
                        // Add new in backend
                        await incomeStore.addIncome(user.id, payload);
                    }
                    // Mark as synced
                    incomes = incomes.map(inc2 => inc2.id === income.id ? { ...inc2, synced: true } : inc2);
                    syncedCount++;
                } catch (error) {
                    failedIncomeIds.push(income.id);
                }
            }
            // Remove only successfully synced incomes
            const remainingIncomes = incomes.filter(inc => !inc.synced || failedIncomeIds.includes(inc.id));
            await saveStoredIncomes(remainingIncomes);
            await loadOfflineData();
            // Refresh online data
            await incomeStore.loadIncomesForMonth(user.id, currentYear, currentMonth);
            if (syncedCount > 0) {
                Alert.alert('Sync Complete', `${syncedCount} income${syncedCount !== 1 ? 's' : ''} synced successfully`);
            }
            if (failedIncomeIds.length > 0) {
                Alert.alert('Partial Sync', `${syncedCount} incomes synced successfully. ${failedIncomeIds.length} failed and will be retried later.`);
            }
        } catch (error) {
            console.error('Sync failed:', error);
            Alert.alert('Sync Failed', 'Unable to sync incomes. Please try again.');
        } finally {
            setIsSyncing(false);
        }
    }, [user?.id, isSyncing, isOnline, currentYear, currentMonth]);

    const resetEditForm = useCallback(() => {
        setEditingId(null);
        setEditModalVisible(false);
        setEditFormData({ amount: '', notes: '', category: '', day: '' });
    }, []);

    const handleAddIncome = useCallback(async () => {
        if (categories.length === 0) {
            Alert.alert('Please Wait', 'Categories are still loading. Please try again in a moment.');
            return;
        }
        const validationError = validateIncomeForm(amount, notes, selectedCategory, user?.id);
        if (validationError) {
            Alert.alert('Missing Information', validationError);
            return;
        }
        setIsLoading(true);
        try {
            const categoryObj = categories.find(cat => cat.id === selectedCategory);
            if (!categoryObj) {
                Alert.alert('Error', ERROR_MESSAGES.CATEGORY_NOT_FOUND);
                setIsLoading(false);
                return;
            }
            const incomeDate = new Date().toISOString();
            const offlineIncome: OfflineIncome = {
                id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                amount: parseFloat(amount),
                description: notes,
                date: incomeDate,
                categoryId: categoryObj.id,
                categoryName: categoryObj.name,
                userId: user!.id,
                synced: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                operation: 'create'
            };
            if (isOnline) {
                try {
                    const incomeStore = useIncomeStore.getState();
                    await incomeStore.addIncome(user!.id, {
                        category_id: parseInt(categoryObj.id),
                        amount: amount.trim(),
                        notes: notes.trim(),
                        income_date: incomeDate
                    });
                    await incomeStore.loadIncomesForMonth(user!.id, currentYear, currentMonth);
                    resetForm();
                    Alert.alert('Success', SUCCESS_MESSAGES.INCOME_ADDED);
                } catch (error) {
                    await saveIncomeOffline(offlineIncome);
                    resetForm();
                    Alert.alert('Success', SUCCESS_MESSAGES.INCOME_ADDED + ' (Saved offline)');
                }
            } else {
                await saveIncomeOffline(offlineIncome);
                resetForm();
                Alert.alert('Success', SUCCESS_MESSAGES.INCOME_ADDED + ' (Offline)');
            }
        } catch (error) {
            Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_ADD);
        } finally {
            setIsLoading(false);
        }
    }, [amount, notes, selectedCategory, user, categories, currentYear, currentMonth, isOnline]);

    const handleEditIncome = useCallback((income: any) => {
        try {
            // Use categoryId for reliable category lookup
            let categoryObj = categories.find(cat => cat.id === income.categoryId);
            // If not found, default to first available category
            if (!categoryObj && categories.length > 0) {
                categoryObj = categories[0];
            }
            const { day } = parseDateComponents(income.date);
            setEditFormData({
                amount: income.amount.toString(),
                notes: income.description || '',
                category: categoryObj?.id || '',
                day: day.toString()
            });
            setEditingId(income.id);
            setEditModalVisible(true);
        } catch (error) {
            console.error('Error preparing income for editing:', error);
            Alert.alert('Error', 'Unable to edit this income. Please try again.');
        }
    }, [categories]);

    const handleUpdateIncome = useCallback(async () => {
        const validationError = validateExpenseForm(editFormData.amount, editFormData.notes, editFormData.category, user?.id); // reuse validation
        if (validationError || !editingId) {
            Alert.alert('Error', validationError || ERROR_MESSAGES.UNABLE_TO_UPDATE);
            return;
        }

        // Validate day selection
        if (!editFormData.day || isNaN(parseInt(editFormData.day)) || parseInt(editFormData.day) < 1 || parseInt(editFormData.day) > 31) {
            Alert.alert('Missing Information', 'Please select a valid day for the income');
            return;
        }

        try {
            const categoryObj = categories.find(cat => cat.id === editFormData.category);
            if (!categoryObj) {
                Alert.alert('Error', ERROR_MESSAGES.CATEGORY_NOT_FOUND);
                return;
            }

            // Get original income to preserve month/year
            const currentIncomes = getCurrentMonthIncomes();
            const originalIncome = currentIncomes.find(inc => inc.id === editingId);
            
            // Create income date using original month/year and selected day in Asia/Manila timezone
            let incomeDate: string;
            if (originalIncome) {
                const dateObj = new Date(originalIncome.date);
                dateObj.setDate(parseInt(editFormData.day));
                incomeDate = dateObj.toISOString();
            } else {
                const now = new Date();
                now.setDate(parseInt(editFormData.day));
                incomeDate = now.toISOString();
            }

            // Check if this is an offline income
            const isOfflineIncome = editingId.startsWith('offline_');
            
            if (isOfflineIncome) {
                try {
                    const incomeStore = useIncomeStore.getState();
                    // Update offline income directly
                    const updatedIncome: OfflineIncome = {
                        id: editingId,
                        amount: parseFloat(editFormData.amount),
                        description: editFormData.notes,
                        date: incomeDate,
                        categoryId: categoryObj.id,
                        categoryName: categoryObj.name,
                        userId: user!.id,
                        synced: false,
                        created_at: originalIncome ? originalIncome.date : new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        operation: 'update'
                    };
                    await saveIncomeOffline(updatedIncome);
                    resetEditForm();
                    Alert.alert('Success', SUCCESS_MESSAGES.INCOME_UPDATED + ' (Offline)');
                } catch (error) {
                    console.error('Error updating offline income:', error);
                    Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_UPDATE);
                }
            } else {
                // Online income update (sync with server)
                try {
                    const incomeStore = useIncomeStore.getState();
                    await incomeStore.updateIncome(user!.id, editingId, {
                        category_id: parseInt(editFormData.category),
                        amount: editFormData.amount.trim(),
                        notes: editFormData.notes.trim(),
                        income_date: incomeDate
                    });
                    await incomeStore.loadIncomesForMonth(user!.id, currentYear, currentMonth);
                    resetEditForm();
                    Alert.alert('Success', SUCCESS_MESSAGES.INCOME_UPDATED);
                } catch (error) {
                    console.error('Error updating income:', error);
                    Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_UPDATE);
                }
            }
        } catch (error) {
            console.error('Error updating income:', error);
            Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_UPDATE);
        }
    }, [editFormData, editingId, user, categories, currentYear, currentMonth, isOnline]);
    
    const handleDeleteIncome = useCallback(async (id: string) => {
        if (!user?.id) {
            Alert.alert('Error', ERROR_MESSAGES.USER_NOT_FOUND);
            return;
        }

        Alert.alert(
            'Delete Income',
            'Are you sure you want to delete this income?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Check if offline income
                            if (id.startsWith('offline_')) {
                                // Remove from offline incomes
                                const incomes = await getStoredIncomes();
                                const updated = incomes.filter(inc => inc.id !== id);
                                await saveStoredIncomes(updated);
                                await loadOfflineData();
                                Alert.alert('Success', SUCCESS_MESSAGES.INCOME_DELETED + ' (Offline)');
                            } else {
                                // Online delete
                                const incomeStore = useIncomeStore.getState();
                                await incomeStore.deleteIncome(user.id, id);
                                await incomeStore.loadIncomesForMonth(user.id, currentYear, currentMonth);
                                await loadOfflineData();
                                Alert.alert('Success', SUCCESS_MESSAGES.INCOME_DELETED);
                            }
                            setEditModalVisible(false);
                        } catch (error) {
                            console.error('Error deleting income:', error);
                            Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_DELETE);
                        }
                    }
                }
            ]
        );
    }, [user, currentYear, currentMonth, isOnline, loadOfflineData]);

    const cancelEdit = () => {
        resetEditForm();
    };    

    const updateEditFormField = useCallback((field: string, value: string) => {
        if (field === 'amount') {
            setEditFormData(prev => ({ ...prev, [field]: formatCostInput(value) }));
        } else {
            setEditFormData(prev => ({ ...prev, [field]: value }));
        }
    }, []);

    const handleAmountChange = useCallback((value: string) => {
        const sanitized = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        setAmount(sanitized);
    }, []);

    const formatDateForDisplay = useCallback((dateString: string) => {
        const dateObj = new Date(dateString);
        const month = dateObj.toLocaleString('default', { month: 'long' });
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${month} ${day}`;
    }, []);

    // Load enabled categories from AsyncStorage
    const loadEnabledCategories = useCallback(async () => {
        try {
            // Load global categories
            const stored = await AsyncStorage.getItem('global_income_categories');
            // Load enabled category IDs for current user
            const enabledIdsRaw = await AsyncStorage.getItem(`user_income_categories_${user?.id}`);
            const enabledIds = enabledIdsRaw ? JSON.parse(enabledIdsRaw) : [];
            if (stored) {
                setCategories(JSON.parse(stored).filter((cat: Category) => enabledIds.includes(cat.id)));
                setEnabledCategoryIds(enabledIds);
            } else {
                setCategories([]);
                setEnabledCategoryIds([]);
            }
        } catch (error) {
            setCategories([]);
        }
    }, [user?.id]);

    useEffect(() => {
        loadEnabledCategories();
        const appStateSub = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                loadEnabledCategories();
            }
        });
        const eventSub = DeviceEventEmitter.addListener('incomeCategoriesChanged', () => {
            loadEnabledCategories();
        });
        return () => {
            appStateSub.remove();
            eventSub.remove();
        };
    }, [user?.id, loadEnabledCategories]);

    return (
        <ScrollView style={styles.container}>
            <MainScreenHeader
                title="Add Income"
                subtitle="Quick and easy income tracking"
                color="#22c55e"
            />
            {/* Offline Alert */}
            {!isOnline && (
                <View style={styles.offlineAlert}>
                    <Text style={styles.offlineAlertText}>
                        You are offline. Any new incomes will be saved locally and synced when you reconnect.
                    </Text>
                </View>
            )}

            {/* Add Income Form */}
            <View style={styles.quickAddForm}>
                <View style={styles.formRow}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Amount</Text>
                        <TextInput
                            style={styles.amountInput}
                            placeholder="0.00"
                            value={amount}
                            onChangeText={handleAmountChange}
                            keyboardType="numeric"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 2 }]}>
                        <Text style={styles.inputLabel}>Notes</Text>
                        <TextInput
                            style={styles.notesInput}
                            value={notes}
                            onChangeText={setNotes}
                        />
                    </View>
                </View>
                <View style={styles.categorySection}>
                    <Text style={styles.inputLabel}>Category</Text>
                    <ScrollView horizontal style={styles.categoryScroll}>
                        {categories.map(cat => (
                            <CategoryChip
                                key={cat.id}
                                category={cat.name}
                                isSelected={selectedCategory === cat.id}
                                getCategoryIcon={() => getCategoryIcon(cat.id)}
                                onPress={() => setSelectedCategory(cat.id)}
                            />
                        ))}
                    </ScrollView>
                </View>
                <TouchableOpacity 
                    style={[
                        styles.quickAddButton, 
                        (isLoading || categories.length === 0) && styles.quickAddButtonDisabled
                    ]} 
                    onPress={handleAddIncome}
                    disabled={isLoading || categories.length === 0}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : categories.length === 0 ? (
                        <Text style={styles.quickAddButtonTextDisabled}>Loading...</Text>
                    ) : (
                        <Text style={styles.quickAddButtonText}>+ Add Income</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Offline Status and Sync Section */}
            {unsyncedCount > 0 && (
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
                                onPress={syncOfflineIncomes}
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
                    <Text style={styles.unsyncedText}>
                        {unsyncedCount} operation{unsyncedCount !== 1 ? 's' : ''} pending sync
                    </Text>
                    <Text style={styles.syncHelperText}>
                        {isOnline 
                            ? 'Tap "Sync Now" to upload your offline changes to the server.' 
                            : 'Connect to the internet to sync your offline changes.'
                        }
                    </Text>
                </View>
            )}

            {/* Toggle Button for Income Details - Only show when details are hidden */}
            {!showIncomeDetails && (
                <View style={styles.toggleSection}>
                    <TouchableOpacity style={styles.toggleButton} onPress={() => setShowIncomeDetails(true)}>
                        <Text style={styles.toggleButtonText}>Show Income Details</Text>
                        <Text style={styles.toggleIcon}>▼</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Hide Button and Recent Income Section - Only show when details are visible */}
            {showIncomeDetails && (
                <>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Total Income This Month</Text>
                        {isSyncing ? (
                            <View style={styles.syncingTotalContainer}>
                                <ActivityIndicator size="small" color="#3b82f6" />
                                <Text style={styles.syncingTotalText}>Syncing...</Text>
                            </View>
                        ) : (
                            <Text style={styles.summaryAmount}>+{combinedTotal.toFixed(2)}</Text>
                        )}
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Income</Text>
                        {isOnline && (
                            <TouchableOpacity onPress={() => navigation.navigate('AllIncome')}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {isLoadingIncomes ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#3b82f6" />
                            <Text style={styles.loadingText}>Loading income...</Text>
                        </View>
                    ) : combinedIncomes.length > 0 ? (
                        combinedIncomes.map((item) => (
                            <IncomeItem
                                key={item.id}
                                item={item}
                                getCategoryIcon={() => getCategoryIcon(item.categoryId)}
                                formatDate={formatDateForDisplay}
                                onEdit={handleEditIncome}
                                onDelete={handleDeleteIncome}
                                editable={true}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No income found</Text>
                            <Text style={styles.emptySubtext}>Add your first income above</Text>
                        </View>
                    )}

                    {/* Hide Button at the bottom when details are shown */}
                    <View style={styles.hideSection}>
                        <TouchableOpacity 
                            style={styles.hideButton} 
                            onPress={() => setShowIncomeDetails(false)}
                        >
                            <Text style={styles.hideButtonText}>
                                Hide Income Details
                            </Text>
                            <Text style={styles.hideIcon}>
                                ▲
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {/* Edit Income Modal */}
            <Modal
                visible={editModalVisible}
                transparent={true}
                animationType="none"
                onRequestClose={cancelEdit}
            >
                <View style={styles.editModalOverlay}>
                    <View style={styles.editModalContainer}>
                        <View style={styles.editModalHeader}>
                            <Text style={styles.editModalTitle}>Edit Income</Text>
                            <TouchableOpacity style={styles.editModalCloseButton} onPress={cancelEdit}>
                                <Text style={styles.editModalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.editFormRow}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Amount</Text>
                                <TextInput
                                    style={styles.amountInput}
                                    value={editFormData.amount}
                                    onChangeText={value => updateEditFormField('amount', value)}
                                    keyboardType="numeric"
                                    placeholder="0.00"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 2 }]}> 
                                <Text style={styles.inputLabel}>Notes</Text>
                                <TextInput
                                    style={styles.notesInput}
                                    value={editFormData.notes}
                                    onChangeText={value => updateEditFormField('notes', value)}
                                />
                            </View>
                        </View>
                        <View style={styles.categorySection}>
                            <Text style={styles.inputLabel}>Category</Text>
                            <ScrollView horizontal style={styles.categoryScroll}>
                                {categories.map(cat => (
                                    <CategoryChip
                                        key={cat.id}
                                        category={cat.name}
                                        isSelected={editFormData.category === cat.id}
                                        getCategoryIcon={() => getCategoryIcon(cat.id)}
                                        onPress={() => updateEditFormField('category', cat.id)}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                        <View style={styles.daySection}>
                            <Text style={styles.inputLabel}>Day</Text>
                            <ScrollView horizontal style={styles.dayScroll}>
                                {[...Array(31)].map((_, i) => (
                                    <TouchableOpacity
                                        key={i + 1}
                                        style={[styles.dayChip, editFormData.day === String(i + 1) && styles.dayChipSelected]}
                                        onPress={() => updateEditFormField('day', String(i + 1))}
                                    >
                                        <Text style={editFormData.day === String(i + 1) ? styles.dayChipTextSelected : styles.dayChipText}>{i + 1}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        <View style={styles.editModalButtons}>
                            <TouchableOpacity style={styles.editCancelButton} onPress={cancelEdit}>
                                <Text style={styles.editCancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.editUpdateButton} onPress={handleUpdateIncome}>
                                <Text style={styles.editUpdateButtonText}>Update</Text>
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
        backgroundColor: '#22c55e', // green
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
        color: '#22c55e', // green
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
        color: '#22c55e', // green
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
    amountInput: {
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
        backgroundColor: '#22c55e', // green for income
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
        backgroundColor: '#22c55e', // green
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
        backgroundColor: '#bbf7d0', // green tint
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#22c55e', // green
    },
    dayChipSelected: {
        backgroundColor: '#22c55e', // green
        borderColor: '#16a34a', // darker green
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
        backgroundColor: '#22c55e', // green
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
        color: '#22c55e', // green
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
    offlineAlert: {
        backgroundColor: '#fef3c7',
        padding: 8,
        borderRadius: 8,
        marginTop: 12,
        marginBottom: 0,
    },
    offlineAlertText: {
        color: '#b45309',
        fontSize: 13,
        textAlign: 'center',
        fontWeight: '500',
    },
});
