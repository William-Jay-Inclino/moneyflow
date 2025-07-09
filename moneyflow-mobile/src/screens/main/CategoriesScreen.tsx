import React, { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';

interface Category {
    id: string;
    name: string;
    icon: string;
    enabled: boolean;
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

export const CategoriesScreen = () => {
    // Initial dummy data with default states
    const [incomeCategories, setIncomeCategories] = useState<Category[]>([
        { id: '1', name: 'Salary', icon: '💼', enabled: true },
        { id: '2', name: 'Freelance', icon: '💻', enabled: true },
        { id: '3', name: 'Investment', icon: '📈', enabled: true },
        { id: '4', name: 'Business', icon: '🏢', enabled: false },
        { id: '5', name: 'Rental', icon: '🏠', enabled: false },
        { id: '6', name: 'Dividends', icon: '💰', enabled: false },
        { id: '7', name: 'Bonus', icon: '🎁', enabled: true },
        { id: '8', name: 'Commission', icon: '🤝', enabled: false },
        { id: '9', name: 'Royalties', icon: '👑', enabled: false },
        { id: '10', name: 'Side Hustle', icon: '🔥', enabled: false },
        { id: '11', name: 'Pension', icon: '👴', enabled: false },
        { id: '12', name: 'Grants', icon: '🎯', enabled: false },
        { id: '13', name: 'Cashback', icon: '💳', enabled: true },
        { id: '14', name: 'Gifts', icon: '🎀', enabled: false },
        { id: '15', name: 'Other Income', icon: '💎', enabled: false },
    ]);

    const [expenseCategories, setExpenseCategories] = useState<Category[]>([
        { id: '16', name: 'Food & Dining', icon: '🍽️', enabled: true },
        { id: '17', name: 'Transportation', icon: '🚗', enabled: true },
        { id: '18', name: 'Entertainment', icon: '🎬', enabled: true },
        { id: '19', name: 'Utilities', icon: '⚡', enabled: true },
        { id: '20', name: 'Shopping', icon: '🛍️', enabled: true },
        { id: '21', name: 'Healthcare', icon: '🏥', enabled: false },
        { id: '22', name: 'Education', icon: '📚', enabled: false },
        { id: '23', name: 'Insurance', icon: '🛡️', enabled: false },
        { id: '24', name: 'Groceries', icon: '🛒', enabled: true },
        { id: '25', name: 'Gas & Fuel', icon: '⛽', enabled: true },
        { id: '26', name: 'Home & Garden', icon: '🏡', enabled: false },
        { id: '27', name: 'Personal Care', icon: '💅', enabled: false },
        { id: '28', name: 'Fitness & Sports', icon: '🏋️', enabled: false },
        { id: '29', name: 'Travel', icon: '✈️', enabled: false },
        { id: '30', name: 'Subscriptions', icon: '📺', enabled: true },
        { id: '31', name: 'Phone & Internet', icon: '📱', enabled: true },
        { id: '32', name: 'Banking & Fees', icon: '🏦', enabled: false },
        { id: '33', name: 'Taxes', icon: '📋', enabled: false },
        { id: '34', name: 'Gifts & Donations', icon: '🎁', enabled: false },
        { id: '35', name: 'Other Expenses', icon: '📦', enabled: false },
    ]);

    const toggleIncomeCategory = useCallback((id: string) => {
        setIncomeCategories(prev => 
            prev.map(cat => 
                cat.id === id ? { ...cat, enabled: !cat.enabled } : cat
            )
        );
    }, []);

    const toggleExpenseCategory = useCallback((id: string) => {
        setExpenseCategories(prev => 
            prev.map(cat => 
                cat.id === id ? { ...cat, enabled: !cat.enabled } : cat
            )
        );
    }, []);

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
                            <Text style={styles.countText}>{enabledIncomeCount} enabled</Text>
                        </View>
                    </View>
                    
                    <View style={styles.categoriesGrid}>
                        {incomeCategories.map((category) => (
                            <CategoryItem
                                key={category.id}
                                category={category}
                                onToggle={toggleIncomeCategory}
                                type="income"
                            />
                        ))}
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
                            <Text style={styles.countText}>{enabledExpenseCount} enabled</Text>
                        </View>
                    </View>
                    
                    <View style={styles.categoriesGrid}>
                        {expenseCategories.map((category) => (
                            <CategoryItem
                                key={category.id}
                                category={category}
                                onToggle={toggleExpenseCategory}
                                type="expense"
                            />
                        ))}
                    </View>
                </View>

                {/* Helper Text */}
                <View style={styles.helperSection}>
                    <Text style={styles.helperText}>
                        💡 Enabled categories will appear when adding income or expenses
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
    // Legacy styles (keeping for compatibility)
    card: {
        backgroundColor: 'white',
        margin: 15,
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    placeholder: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
});
