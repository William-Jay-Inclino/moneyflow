import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Dimensions, ActivityIndicator } from 'react-native';
import { ExpenseItem, CategoryChip } from '../../components';
import { useAuthStore } from '../../store/authStore';
import { transactionApi, categoryApi } from '../../services/api';
import { Category } from '../../types';

export const ExpenseScreen = ({ navigation }: { navigation: any }) => {
    const { user } = useAuthStore();
    
    const [notes, setNotes] = useState('');
    const [cost, setCost] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editFormData, setEditFormData] = useState({ cost: '', notes: '', category: '' });
    const [showExpenseDetails, setShowExpenseDetails] = useState(false);
    const [expenseList, setExpenseList] = useState<any[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);

    // Load user data on component mount
    useEffect(() => {
        loadInitialData();
    }, [user]);

    const loadInitialData = async () => {
        if (!user?.id) return;
        
        try {
            setIsLoadingExpenses(true);
            await Promise.all([
                loadCategories(),
                loadExpenses()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            Alert.alert('Error', 'Failed to load data. Please try again.');
        } finally {
            setIsLoadingExpenses(false);
        }
    };

    const loadCategories = async () => {
        if (!user?.id) return;
        
        try {
            const expenseCategories = await categoryApi.getUserCategories(user.id, 'EXPENSE');
            setCategories(expenseCategories);
        } catch (error) {
            console.error('Error loading categories:', error);
            // Fallback to get all categories and filter
            try {
                const response = await categoryApi.getCategories(user.id);
                const allCategories = response.data || [];
                const filtered = allCategories.filter(cat => cat.type === 'expense');
                setCategories(filtered);
            } catch (fallbackError) {
                console.error('Fallback category loading also failed:', fallbackError);
            }
        }
    };

    const loadExpenses = async () => {
        if (!user?.id) return;
        
        try {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            
            const data = await transactionApi.getExpenses(user.id, year, month);
            const formattedExpenses = data.map((expense: any) => ({
                id: expense.id,
                amount: parseFloat(expense.cost),
                description: expense.notes || 'No description',
                category: expense.category?.category?.name || 'Other',
                date: new Date(expense.created_at).toISOString().split('T')[0],
                time: new Date(expense.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            }));
            setExpenseList(formattedExpenses);
        } catch (error) {
            console.error('Error loading expenses:', error);
        }
    };

    const handleAddExpense = useCallback(async () => {
        if (!cost.trim()) {
            Alert.alert('Missing Cost', 'Please enter the expense amount');
            return;
        }
        if (!notes.trim()) {
            Alert.alert('Missing Notes', 'Please enter a description');
            return;
        }
        if (!selectedCategory) {
            Alert.alert('Missing Category', 'Please select a category');
            return;
        }
        if (!user?.id) {
            Alert.alert('Error', 'User not found. Please login again.');
            return;
        }

        setIsLoading(true);
        
        try {
            // Find the selected category object
            const categoryObj = categories.find(cat => cat.id === selectedCategory);
            if (!categoryObj) {
                Alert.alert('Error', 'Selected category not found');
                return;
            }

            const newExpense = await transactionApi.createExpense(user.id, {
                category_id: parseInt(categoryObj.id),
                cost: cost.trim(),
                notes: notes.trim()
            });

            const formattedExpense = {
                id: newExpense.id,
                amount: parseFloat(newExpense.cost),
                description: newExpense.notes || 'No description',
                category: categoryObj.name,
                date: new Date(newExpense.created_at).toISOString().split('T')[0],
                time: new Date(newExpense.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            };
            
            setExpenseList(prev => [formattedExpense, ...prev]);
            Alert.alert('Success', 'Expense added successfully');
            
            // Reset form
            setNotes('');
            setCost('');
            setSelectedCategory('');
        } catch (error) {
            console.error('Error adding expense:', error);
            Alert.alert('Error', 'Failed to add expense. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [cost, notes, selectedCategory, user, categories]);

    const handleEditExpense = useCallback((expense: any) => {
        // Find the category ID by name for the edit form
        const categoryObj = categories.find(cat => cat.name === expense.category);
        setEditFormData({
            cost: expense.amount.toString(),
            notes: expense.description,
            category: categoryObj?.id || ''
        });
        setEditingId(expense.id);
        setEditModalVisible(true);
    }, [categories]);

    const handleDeleteExpense = useCallback(async (id: string) => {
        if (!user?.id) {
            Alert.alert('Error', 'User not found. Please login again.');
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
                            await transactionApi.deleteExpense(user.id, id);
                            setExpenseList(prev => prev.filter(item => item.id !== id));
                            Alert.alert('Success', 'Expense deleted successfully');
                        } catch (error) {
                            console.error('Error deleting expense:', error);
                            Alert.alert('Error', 'Failed to delete expense. Please try again.');
                        }
                    }
                }
            ]
        );
    }, [user]);

    const cancelEdit = useCallback(() => {
        setEditingId(null);
        setEditModalVisible(false);
        setEditFormData({ cost: '', notes: '', category: '' });
    }, []);

    const handleUpdateExpense = useCallback(async () => {
        if (!editFormData.cost.trim()) {
            Alert.alert('Missing Cost', 'Please enter the expense amount');
            return;
        }
        if (!editFormData.notes.trim()) {
            Alert.alert('Missing Notes', 'Please enter a description');
            return;
        }
        if (!editFormData.category) {
            Alert.alert('Missing Category', 'Please select a category');
            return;
        }
        if (!user?.id || !editingId) {
            Alert.alert('Error', 'Unable to update expense');
            return;
        }

        try {
            // Find the selected category object
            const categoryObj = categories.find(cat => cat.id === editFormData.category);
            if (!categoryObj) {
                Alert.alert('Error', 'Selected category not found');
                return;
            }

            const updatedExpense = await transactionApi.updateExpense(user.id, editingId, {
                category_id: parseInt(categoryObj.id),
                cost: editFormData.cost.trim(),
                notes: editFormData.notes.trim()
            });

            setExpenseList(prev => prev.map(item => 
                item.id === editingId 
                    ? { 
                        ...item, 
                        amount: parseFloat(updatedExpense.cost), 
                        description: updatedExpense.notes,
                        category: categoryObj.name
                    }
                    : item
            ));
            Alert.alert('Success', 'Expense updated successfully');
            cancelEdit();
        } catch (error) {
            console.error('Error updating expense:', error);
            Alert.alert('Error', 'Failed to update expense. Please try again.');
        }
    }, [editFormData, editingId, user, categories, cancelEdit]);
    
    const totalExpenses = useMemo(() => 
        expenseList.reduce((sum, item) => sum + item.amount, 0), 
        [expenseList]
    );

    const getCategoryIcon = useCallback((category: string) => {
        switch (category) {
            case 'Food & Dining': return '🍽️';
            case 'Transportation': return '🚗';
            case 'Utilities': return '⚡';
            case 'Entertainment': return '🎬';
            case 'Shopping': return '🛍️';
            default: return '💳';
        }
    }, []);

    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}/${day}`;
    }, []);

    const handleScrollBeginDrag = useCallback(() => {
        // Dropdowns are now handled by individual ExpenseItem components
    }, []);

    const handleCategorySelect = useCallback((category: string) => {
        setSelectedCategory(category);
    }, []);

    const handleEditFormCategorySelect = useCallback((category: string) => {
        setEditFormData(prev => ({ ...prev, category }));
    }, []);

    const updateEditFormField = useCallback((field: string, value: string) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    return (
        <ScrollView 
            style={styles.container}
            onScrollBeginDrag={handleScrollBeginDrag}
        >
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
                            onChangeText={setCost}
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
                                onPress={() => handleCategorySelect(category.id)}
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
                    ) : expenseList.length > 0 ? (
                        expenseList.map((item) => (
                            <ExpenseItem
                                key={item.id}
                                item={item}
                                getCategoryIcon={getCategoryIcon}
                                formatDate={formatDate}
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
                                        onPress={() => handleEditFormCategorySelect(category.id)}
                                        getCategoryIcon={getCategoryIcon}
                                        color="#3b82f6"
                                    />
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
    // Quick Add Form Styles
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
    formTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 16,
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
    helperText: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 4,
        fontStyle: 'italic',
    },
    categoryScroll: {
        marginTop: 8,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    // Edit Modal Styles
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
    // Toggle Section Styles
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
    // Hide Section Styles
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
    // Loading and Empty States
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
});
