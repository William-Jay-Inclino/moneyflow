import React, { useState, useCallback, memo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, DeviceEventEmitter } from 'react-native';
import { useAuthStore } from '../../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { categoryApi } from '../../services';
import { MainScreenHeader } from '../../components/MainScreenHeader';

interface Category {
    id: string;
    name: string;
    icon: string;
    enabled: boolean;
    type: 'INCOME' | 'EXPENSE';
}

// Category Item Component
const CategoryItem = memo(({ 
    category, 
    onToggle,
    type 
}: { 
    category: Category, 
    onToggle: (id: string) => void,
    type: 'income' | 'expense'
}) => {
    const handlePress = useCallback(() => {
        onToggle(category.id);
    }, [category.id, onToggle]);

    const getCardStyle = () => {
        if (!category.enabled) {
            return [styles.categoryCard, styles.categoryCardDisabled];
        }
        return type === 'income' 
            ? [styles.categoryCard, styles.categoryCardIncomeEnabled]
            : [styles.categoryCard, styles.categoryCardExpenseEnabled];
    };

    const getTextStyle = () => {
        return category.enabled 
            ? styles.categoryTextEnabled 
            : styles.categoryTextDisabled;
    };

    return (
        <TouchableOpacity 
            style={getCardStyle()} 
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={styles.categoryContent}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[styles.categoryName, getTextStyle()]}> {category.name} </Text>
                <View style={[ styles.toggleIndicator, category.enabled ? (type === 'income' ? styles.toggleEnabledIncome : styles.toggleEnabledExpense) : styles.toggleDisabled ]}>
                    <Text style={styles.toggleText}> {category.enabled ? '✓' : '○'} </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

const CategoriesScreen = () => {
    const { user } = useAuthStore();
    const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(true);

    // Network status effect
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            const online = state.isConnected === true && state.isInternetReachable === true;
            setIsOnline(online);
        });
        return unsubscribe;
    }, []);

    // Helper functions for AsyncStorage keys
    const incomeKey = `user_income_categories_${user?.id}`;
    const expenseKey = `user_expense_categories_${user?.id}`;

    // Load categories from API or AsyncStorage depending on network status
    const loadCategories = useCallback(async () => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            let allIncomeData, allExpenseData;
            if (isOnline) {
                // Fetch global categories from API
                [allIncomeData, allExpenseData] = await Promise.all([
                    categoryApi.getAllCategories('INCOME'),
                    categoryApi.getAllCategories('EXPENSE'),
                ]);
            } else {
                // Load global categories from AsyncStorage
                const [storedIncome, storedExpense] = await Promise.all([
                    AsyncStorage.getItem('global_income_categories'),
                    AsyncStorage.getItem('global_expense_categories'),
                ]);
                allIncomeData = storedIncome ? JSON.parse(storedIncome) : [];
                allExpenseData = storedExpense ? JSON.parse(storedExpense) : [];
            }

            // Load user's enabled categories from AsyncStorage
            const [storedUserIncome, storedUserExpense] = await Promise.all([
                AsyncStorage.getItem(incomeKey),
                AsyncStorage.getItem(expenseKey),
            ]);
            const enabledIncomeIds = storedUserIncome ? JSON.parse(storedUserIncome) : [];
            const enabledExpenseIds = storedUserExpense ? JSON.parse(storedUserExpense) : [];

            // Transform global categories and mark enabled from local storage
            const transformedIncome = allIncomeData.map((cat: any) => ({
                id: cat.id?.toString() || '',
                name: cat.name || 'Unknown',
                icon: cat.icon || '💰',
                enabled: enabledIncomeIds.includes(cat.id?.toString()),
                type: 'INCOME' as const
            }));
            const transformedExpense = allExpenseData.map((cat: any) => ({
                id: cat.id?.toString() || '',
                name: cat.name || 'Unknown',
                icon: cat.icon || '💸',
                enabled: enabledExpenseIds.includes(cat.id?.toString()),
                type: 'EXPENSE' as const
            }));

            // Save all global categories with enabled state to AsyncStorage if online
            if (isOnline) {
                await AsyncStorage.setItem('global_income_categories', JSON.stringify(transformedIncome));
                await AsyncStorage.setItem('global_expense_categories', JSON.stringify(transformedExpense));
            }

            setIncomeCategories(transformedIncome);
            setExpenseCategories(transformedExpense);
        } catch (error: any) {
            setError('Failed to load categories. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, isOnline]);

    // Load categories on mount
    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    // Toggle income category and update local storage
    const toggleIncomeCategory = useCallback(async (id: string) => {
        if (!user?.id) return;
        const category = incomeCategories.find(cat => cat.id === id);
        if (!category) return;
        try {
            const updated = category.enabled
                ? incomeCategories.filter(cat => cat.id !== id && cat.enabled).map(cat => cat.id)
                : [...incomeCategories.filter(cat => cat.enabled).map(cat => cat.id), id];
            await AsyncStorage.setItem(incomeKey, JSON.stringify(updated));
            const newIncomeCategories = incomeCategories.map(cat => cat.id === id ? { ...cat, enabled: !cat.enabled } : cat);
            setIncomeCategories(newIncomeCategories);
            // Update global categories in AsyncStorage
            await AsyncStorage.setItem('global_income_categories', JSON.stringify(newIncomeCategories));
            // Emit event to notify ExpenseScreen (optional, if you want to refresh income categories elsewhere)
            DeviceEventEmitter.emit('incomeCategoriesChanged');
        } catch (error) {
            Alert.alert('Error', 'Failed to update category. Please try again.');
        }
    }, [user?.id, incomeCategories]);

    // Toggle expense category and update local storage
    const toggleExpenseCategory = useCallback(async (id: string) => {
        if (!user?.id) return;
        const category = expenseCategories.find(cat => cat.id === id);
        if (!category) return;
        try {
            const updated = category.enabled
                ? expenseCategories.filter(cat => cat.id !== id && cat.enabled).map(cat => cat.id)
                : [...expenseCategories.filter(cat => cat.enabled).map(cat => cat.id), id];
            await AsyncStorage.setItem(expenseKey, JSON.stringify(updated));
            const newExpenseCategories = expenseCategories.map(cat => cat.id === id ? { ...cat, enabled: !cat.enabled } : cat);
            setExpenseCategories(newExpenseCategories);
            // Update global categories in AsyncStorage
            await AsyncStorage.setItem('global_expense_categories', JSON.stringify(newExpenseCategories));
            // Emit event to notify ExpenseScreen
            DeviceEventEmitter.emit('expenseCategoriesChanged');
        } catch (error) {
            Alert.alert('Error', 'Failed to update category. Please try again.');
        }
    }, [user?.id, expenseCategories]);

    // Check for offline status
    if (!isOnline) {
        return (
            <SafeAreaView style={styles.container}>
                <MainScreenHeader
                    title="Manage Categories"
                    subtitle="Select which categories you want to use"
                    color="#14b8a6" // modern teal
                />
                <View style={{backgroundColor: '#fef3c7', padding: 8, borderRadius: 8, margin: 16}}>
                    <Text style={{color: '#b45309', fontSize: 13, textAlign: 'center', fontWeight: '500'}}>
                        You are offline. Categories cannot be displayed. Please reconnect to manage your categories.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <MainScreenHeader
                    title="Manage Categories"
                    subtitle="Loading your categories..."
                    color="#14b8a6"
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Loading categories...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <MainScreenHeader
                    title="Manage Categories"
                    subtitle="Something went wrong"
                    color="#14b8a6"
                />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadCategories}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const enabledIncomeCount = incomeCategories.filter(cat => cat.enabled).length;
    const enabledExpenseCount = expenseCategories.filter(cat => cat.enabled).length;

    return (
        <SafeAreaView style={styles.container}>
            <MainScreenHeader
                title="Manage Categories"
                subtitle="Select which categories you want to use"
                color="#14b8a6"
            />
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Income Categories Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <Text style={styles.sectionIcon}>💰</Text>
                            <Text style={styles.sectionTitle}>Income Categories</Text>
                        </View>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{enabledIncomeCount} of {incomeCategories.length} enabled</Text>
                        </View>
                    </View>
                    <View style={styles.categoriesGrid}>
                        {incomeCategories.length > 0 ? (
                            incomeCategories.map((category) => (
                                <CategoryItem
                                    key={category.id}
                                    category={category}
                                    onToggle={toggleIncomeCategory}
                                    type="income"
                                />
                            ))
                        ) : (
                            <View style={styles.emptyStateContainer}>
                                <Text style={styles.emptyStateText}>No income categories found</Text>
                            </View>
                        )}
                    </View>
                </View>
                {/* Expense Categories Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <Text style={styles.sectionIcon}>💸</Text>
                            <Text style={styles.sectionTitle}>Expense Categories</Text>
                        </View>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{enabledExpenseCount} of {expenseCategories.length} enabled</Text>
                        </View>
                    </View>
                    <View style={styles.categoriesGrid}>
                        {expenseCategories.length > 0 ? (
                            expenseCategories.map((category) => (
                                <CategoryItem
                                    key={category.id}
                                    category={category}
                                    onToggle={toggleExpenseCategory}
                                    type="expense"
                                />
                            ))
                        ) : (
                            <View style={styles.emptyStateContainer}>
                                <Text style={styles.emptyStateText}>No expense categories found</Text>
                            </View>
                        )}
                    </View>
                </View>
                {/* Helper Text */}
                <View style={styles.helperSection}>
                    <Text style={styles.helperText}>
                        💡 All available categories are shown. Tap to enable/disable them for your account.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#dbeafe',
        opacity: 0.9,
    },
    scrollContainer: {
        flex: 1,
    },
    section: {
        marginTop: 20,
        marginHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    countBadge: {
        backgroundColor: '#e2e8f0',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    countText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        marginBottom: 6,
        width: '47%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    categoryCardDisabled: {
        backgroundColor: '#f8fafc',
        borderColor: '#e2e8f0',
        opacity: 0.7,
    },
    categoryCardIncomeEnabled: {
        backgroundColor: '#f0fdf4',
        borderColor: '#22c55e',
        shadowColor: '#22c55e',
        shadowOpacity: 0.15,
    },
    categoryCardExpenseEnabled: {
        backgroundColor: '#fef2f2',
        borderColor: '#ef4444',
        shadowColor: '#ef4444',
        shadowOpacity: 0.15,
    },
    categoryContent: {
        alignItems: 'center',
        position: 'relative',
    },
    categoryIcon: {
        fontSize: 24,
        marginBottom: 6,
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 16,
    },
    categoryTextEnabled: {
        color: '#1e293b',
    },
    categoryTextDisabled: {
        color: '#94a3b8',
    },
    toggleIndicator: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
    },
    toggleDisabled: {
        backgroundColor: '#f1f5f9',
        borderColor: '#cbd5e1',
    },
    toggleEnabledIncome: {
        backgroundColor: '#22c55e',
        borderColor: '#16a34a',
    },
    toggleEnabledExpense: {
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
    },
    toggleText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: 'white',
    },
    helperSection: {
        marginTop: 32,
        marginBottom: 40,
        marginHorizontal: 20,
        backgroundColor: '#fffbeb',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b',
    },
    helperText: {
        fontSize: 14,
        color: '#92400e',
        lineHeight: 20,
        textAlign: 'center',
    },
    // Loading and error states
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#ef4444',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    retryButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    // Empty state styles
    emptyStateContainer: {
        width: '100%',
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
    },
});

export default CategoriesScreen;
