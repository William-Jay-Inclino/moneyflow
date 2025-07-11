import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { ExpenseItem, CategoryChip } from '../../components';
import { useAuthStore, useExpenseStore } from '../../store';
import { formatCostInput } from '../../utils/costUtils';
import { formatDate } from '../../utils/dateUtils';
import { validateExpenseForm } from '../../utils/formValidation';

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

export const ExpenseScreen = ({ navigation }: { navigation: any }) => {
    const { user } = useAuthStore();
    const {
        categories,
        getCurrentMonthExpenses,
        getRecentExpenses,
        getCurrentMonthTotal,
        isLoadingMonth,
        currentMonth,
        currentYear,
        loadExpensesForMonth,
        loadCategories,
        addExpense,
        updateExpense,
        deleteExpense,
        getCategoryIcon,
        updateCurrentDate,
    } = useExpenseStore();
    
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

    // Always use current month/year - these values update automatically when date changes
    const isLoadingExpenses = isLoadingMonth(currentYear, currentMonth);
    const recentExpenses = getRecentExpenses(RECENT_EXPENSES_LIMIT);
    const totalExpenses = getCurrentMonthTotal();

    // Load user data on component mount
    useEffect(() => {
        loadInitialData();
    }, [user]);

    const loadInitialData = async () => {
        if (!user?.id) return;
        
        try {
            // Ensure we're using the current month/year
            updateCurrentDate();
            
            await Promise.all([
                loadCategories(user.id),
                loadExpensesForMonth(user.id, currentYear, currentMonth)
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_LOAD);
        }
    };

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
        const validationError = validateExpenseForm(cost, notes, selectedCategory, user?.id);
        if (validationError) {
            Alert.alert('Missing Information', validationError);
            return;
        }

        // Validate day selection - always use current day
        const currentDay = new Date().getDate();

        setIsLoading(true);
        
        try {
            const categoryObj = categories.find(cat => cat.id === selectedCategory);
            if (!categoryObj) {
                Alert.alert('Error', ERROR_MESSAGES.CATEGORY_NOT_FOUND);
                return;
            }

            // Create expense date using current month/year and current day
            const today = new Date();
            const expenseDate = new Date(today.getFullYear(), today.getMonth(), currentDay);

            await addExpense(user!.id, {
                category_id: parseInt(categoryObj.id),
                cost: cost.trim(),
                notes: notes.trim(),
                expense_date: expenseDate.toISOString().split('T')[0] // Send as YYYY-MM-DD format
            });
            
            // Reset form
            resetForm();
            
            Alert.alert('Success', SUCCESS_MESSAGES.EXPENSE_ADDED);
        } catch (error) {
            console.error('Error adding expense:', error);
            Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_ADD);
        } finally {
            setIsLoading(false);
        }
    }, [cost, notes, selectedCategory, user, categories, addExpense]);

    const handleEditExpense = useCallback((expense: any) => {
        try {
            const categoryObj = categories.find(cat => cat.name === expense.category);
            const expenseDate = new Date(expense.date);
            setEditFormData({
                cost: expense.amount.toString(),
                notes: expense.description || '',
                category: categoryObj?.id || '',
                day: expenseDate.getDate().toString()
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
            
            // Create expense date using original month/year and selected day
            let expenseDate: Date;
            if (originalExpense) {
                const originalDate = new Date(originalExpense.date);
                expenseDate = new Date(originalDate.getFullYear(), originalDate.getMonth(), parseInt(editFormData.day));
            } else {
                // Fallback to current month/year if original expense not found
                const today = new Date();
                expenseDate = new Date(today.getFullYear(), today.getMonth(), parseInt(editFormData.day));
            }

            await updateExpense(user!.id, editingId, {
                category_id: parseInt(categoryObj.id),
                cost: editFormData.cost.trim(),
                notes: editFormData.notes.trim(),
                expense_date: expenseDate.toISOString().split('T')[0] // Send as YYYY-MM-DD format
            });
            
            Alert.alert('Success', SUCCESS_MESSAGES.EXPENSE_UPDATED);
            resetEditForm();
        } catch (error) {
            console.error('Error updating expense:', error);
            Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_UPDATE);
        }
    }, [editFormData, editingId, user, categories, updateExpense]);
    
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
                            await deleteExpense(user.id, id);
                            Alert.alert('Success', SUCCESS_MESSAGES.EXPENSE_DELETED);
                        } catch (error) {
                            console.error('Error deleting expense:', error);
                            Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_DELETE);
                        }
                    }
                }
            ]
        );
    }, [user, deleteExpense]);

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

    const formatCurrentMonthYear = useCallback(() => {
        const date = new Date(currentYear, currentMonth - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }, [currentYear, currentMonth]);

    const formatDateForDisplay = useCallback((dateString: string) => {
        return formatDate(dateString);
    }, []);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Add Expense</Text>
                <Text style={styles.subtitle}>Quick and easy expense tracking for {formatCurrentMonthYear()}</Text>
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
                        {categories.map((category) => (
                            <CategoryChip
                                key={category.id}
                                category={category.name}
                                isSelected={selectedCategory === category.id}
                                onPress={() => setSelectedCategory(category.id)}
                                getCategoryIcon={getCategoryIcon}
                                color="#3b82f6"
                            />
                        ))}
                    </ScrollView>
                </View>



                <TouchableOpacity 
                    style={[styles.quickAddButton, isLoading && { opacity: 0.6 }]} 
                    onPress={handleAddExpense}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text style={styles.quickAddButtonText}>+ Add Expense</Text>
                    )}
                </TouchableOpacity>
            </View>

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
                        <Text style={styles.summaryAmount}>-{totalExpenses.toFixed(2)}</Text>
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
                    ) : recentExpenses.length > 0 ? (
                        recentExpenses.map((item) => (
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
});
