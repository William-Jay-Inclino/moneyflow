import React, { useState, useCallback, memo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../../store';
import { useIncomeStore } from '../../store/incomeStore';
import { useExpenseStore } from '../../store/expenseStore';
import { categoryApi } from '../../services';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

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
                <Text style={[styles.categoryName, getTextStyle()]}>
                    {category.name}
                </Text>
                <View style={[
                    styles.toggleIndicator,
                    category.enabled 
                        ? (type === 'income' ? styles.toggleEnabledIncome : styles.toggleEnabledExpense)
                        : styles.toggleDisabled
                ]}>
                    <Text style={styles.toggleText}>
                        {category.enabled ? '✓' : '○'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

const CategoriesScreen = () => {
    const { user } = useAuthStore();
    const { loadCategories: loadIncomeCategories } = useIncomeStore();
    const { loadCategories: loadExpenseCategories } = useExpenseStore();
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

    // Function to refresh categories in other screens
    const refreshOtherScreenCategories = useCallback(async () => {
        if (!user?.id) return;
        
        try {
            // Refresh categories in both Income and Expense stores
            await Promise.all([
                loadIncomeCategories(user.id),
                loadExpenseCategories(user.id)
            ]);
        } catch (error) {
            console.error('Error refreshing other screen categories:', error);
            // Don't show error to user as this is a background operation
        }
    }, [user?.id, loadIncomeCategories, loadExpenseCategories]);

    // Load categories from API with better error handling
    const loadCategories = useCallback(async () => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        console.log('🔄 CategoriesScreen.loadCategories START');
        console.log('👤 User ID:', user.id);

        try {
            console.log('📡 Testing API connectivity...');
            
            // Fetch all global categories and user's assigned categories in parallel
            console.log('📤 Making parallel API calls...');
            const [allIncomeData, allExpenseData, userIncomeData, userExpenseData] = await Promise.all([
                categoryApi.getAllCategories('INCOME'),
                categoryApi.getAllCategories('EXPENSE'),
                categoryApi.getUserCategories(user.id, 'INCOME'),
                categoryApi.getUserCategories(user.id, 'EXPENSE')
            ]);
            
            console.log('✅ All API calls successful');
            console.log('📊 Data received:', {
                allIncomeCount: allIncomeData.length,
                allExpenseCount: allExpenseData.length,
                userIncomeCount: userIncomeData.length,
                userExpenseCount: userExpenseData.length
            });

            // Create sets of user's assigned category IDs for quick lookup
            const userIncomeCategoryIds = new Set(
                userIncomeData.map((cat: any) => cat.category_id || cat.id)
            );
            const userExpenseCategoryIds = new Set(
                userExpenseData.map((cat: any) => cat.category_id || cat.id)
            );

            console.log('🔍 User category IDs:', {
                income: Array.from(userIncomeCategoryIds),
                expense: Array.from(userExpenseCategoryIds)
            });

            // Transform all global categories and mark as enabled if user has them assigned
            const transformedIncome = allIncomeData.map((cat: any) => ({
                id: cat.id?.toString() || '',
                name: cat.name || 'Unknown',
                icon: cat.icon || '💰',
                enabled: userIncomeCategoryIds.has(cat.id),
                type: 'INCOME' as const
            }));

            const transformedExpense = allExpenseData.map((cat: any) => ({
                id: cat.id?.toString() || '',
                name: cat.name || 'Unknown',
                icon: cat.icon || '💸',
                enabled: userExpenseCategoryIds.has(cat.id),
                type: 'EXPENSE' as const
            }));

            console.log('✅ Categories transformed and ready');
            console.log('📈 Final counts:', {
                incomeCategories: transformedIncome.length,
                expenseCategories: transformedExpense.length,
                enabledIncome: transformedIncome.filter(c => c.enabled).length,
                enabledExpense: transformedExpense.filter(c => c.enabled).length
            });

            setIncomeCategories(transformedIncome);
            setExpenseCategories(transformedExpense);
        } catch (error: any) {
            console.error('❌ Error loading categories:', error);
            console.error('❌ Error details:', {
                message: error?.message || 'Unknown error',
                status: error?.response?.status || 'No status',
                statusText: error?.response?.statusText || 'No status text',
                url: error?.config?.url || 'No URL',
                method: error?.config?.method || 'No method'
            });
            setError('Failed to load categories. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    // Load categories on mount
    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const toggleIncomeCategory = useCallback(async (id: string) => {
        if (!user?.id) {
            console.log('❌ toggleIncomeCategory: No user ID found');
            return;
        }

        const category = incomeCategories.find(cat => cat.id === id);
        if (!category) {
            console.log('❌ toggleIncomeCategory: Category not found for ID:', id);
            return;
        }

        console.log('🔄 toggleIncomeCategory START:', {
            userId: user.id,
            categoryId: id,
            categoryName: category.name,
            currentlyEnabled: category.enabled,
            action: category.enabled ? 'REMOVE' : 'ASSIGN'
        });

        try {
            if (category.enabled) {
                console.log('📤 API CALL: removeCategoryFromUser', { userId: user.id, categoryId: parseInt(id) });
                await categoryApi.removeCategoryFromUser(user.id, parseInt(id));
                console.log('✅ API SUCCESS: removeCategoryFromUser');
            } else {
                console.log('📤 API CALL: assignCategoryToUser', { userId: user.id, categoryId: parseInt(id) });
                await categoryApi.assignCategoryToUser(user.id, parseInt(id));
                console.log('✅ API SUCCESS: assignCategoryToUser');
            }

            // Update local state
            setIncomeCategories(prev => 
                prev.map(cat => 
                    cat.id === id ? { ...cat, enabled: !cat.enabled } : cat
                )
            );
            console.log('✅ Local state updated successfully');

            // Refresh categories in IncomeScreen to reflect changes
            console.log('🔄 Refreshing IncomeScreen categories...');
            loadIncomeCategories(user.id);
            console.log('✅ toggleIncomeCategory COMPLETE');
        } catch (error: any) {
            console.error('❌ Error toggling income category:', error);
            console.error('❌ Error details:', {
                message: error?.message || 'Unknown error',
                status: error?.response?.status || 'No status',
                statusText: error?.response?.statusText || 'No status text',
                url: error?.config?.url || 'No URL',
                method: error?.config?.method || 'No method',
                data: error?.config?.data || 'No data'
            });
            Alert.alert('Error', `Failed to update category. Please try again.\n\nDebug: ${error?.response?.status || 'Unknown'} - ${error?.response?.statusText || 'Unknown error'}`);
        }
    }, [user?.id, incomeCategories, loadIncomeCategories]);

    const toggleExpenseCategory = useCallback(async (id: string) => {
        if (!user?.id) {
            console.log('❌ toggleExpenseCategory: No user ID found');
            return;
        }

        const category = expenseCategories.find(cat => cat.id === id);
        if (!category) {
            console.log('❌ toggleExpenseCategory: Category not found for ID:', id);
            return;
        }

        console.log('🔄 toggleExpenseCategory START:', {
            userId: user.id,
            categoryId: id,
            categoryName: category.name,
            currentlyEnabled: category.enabled,
            action: category.enabled ? 'REMOVE' : 'ASSIGN'
        });

        try {
            if (category.enabled) {
                console.log('📤 API CALL: removeCategoryFromUser', { userId: user.id, categoryId: parseInt(id) });
                await categoryApi.removeCategoryFromUser(user.id, parseInt(id));
                console.log('✅ API SUCCESS: removeCategoryFromUser');
            } else {
                console.log('📤 API CALL: assignCategoryToUser', { userId: user.id, categoryId: parseInt(id) });
                await categoryApi.assignCategoryToUser(user.id, parseInt(id));
                console.log('✅ API SUCCESS: assignCategoryToUser');
            }

            // Update local state
            setExpenseCategories(prev => 
                prev.map(cat => 
                    cat.id === id ? { ...cat, enabled: !cat.enabled } : cat
                )
            );
            console.log('✅ Local state updated successfully');

            // Refresh categories in ExpenseScreen to reflect changes
            console.log('🔄 Refreshing ExpenseScreen categories...');
            loadExpenseCategories(user.id);
            console.log('✅ toggleExpenseCategory COMPLETE');
        } catch (error: any) {
            console.error('❌ Error toggling expense category:', error);
            console.error('❌ Error details:', {
                message: error?.message || 'Unknown error',
                status: error?.response?.status || 'No status',
                statusText: error?.response?.statusText || 'No status text',
                url: error?.config?.url || 'No URL',
                method: error?.config?.method || 'No method',
                data: error?.config?.data || 'No data'
            });
            Alert.alert('Error', `Failed to update category. Please try again.\n\nDebug: ${error?.response?.status || 'Unknown'} - ${error?.response?.statusText || 'Unknown error'}`);
        }
    }, [user?.id, expenseCategories, loadExpenseCategories]);

    // Check for offline status
    if (!isOnline) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Manage Categories</Text>
                    <Text style={styles.subtitle}>Select which categories you want to use</Text>
                </View>
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
                <View style={styles.header}>
                    <Text style={styles.title}>Manage Categories</Text>
                    <Text style={styles.subtitle}>Loading your categories...</Text>
                </View>
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
                <View style={styles.header}>
                    <Text style={styles.title}>Manage Categories</Text>
                    <Text style={styles.subtitle}>Something went wrong</Text>
                </View>
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
            <View style={styles.header}>
                <Text style={styles.title}>Manage Categories</Text>
                <Text style={styles.subtitle}>Select which categories you want to use</Text>
            </View>

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
