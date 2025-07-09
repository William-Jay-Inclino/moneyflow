import React, { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Dimensions } from 'react-native';
import { ExpenseItem, CategoryChip } from '../../components';

export const ExpenseScreen = ({ navigation }: { navigation: any }) => {
    const [notes, setNotes] = useState('');
    const [cost, setCost] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editFormData, setEditFormData] = useState({ cost: '', notes: '', category: '' });
    const [showExpenseDetails, setShowExpenseDetails] = useState(false);
    const [expenseList, setExpenseList] = useState([
        {
            id: '1',
            amount: 85.50,
            description: 'Grocery Shopping',
            category: 'Food & Dining',
            date: '2025-07-08',
            time: '06:30 PM'
        },
        {
            id: '2',
            amount: 45.00,
            description: 'Gas Station',
            category: 'Transportation',
            date: '2025-07-07',
            time: '08:15 AM'
        },
        {
            id: '3',
            amount: 120.00,
            description: 'Electric Bill',
            category: 'Utilities',
            date: '2025-07-06',
            time: '12:00 PM'
        },
        {
            id: '4',
            amount: 25.99,
            description: 'Netflix Subscription',
            category: 'Entertainment',
            date: '2025-07-05',
            time: '09:30 AM'
        },
        {
            id: '5',
            amount: 67.80,
            description: 'Restaurant Dinner',
            category: 'Food & Dining',
            date: '2025-07-04',
            time: '07:45 PM'
        },
        {
            id: '6',
            amount: 15.00,
            description: 'Coffee Shop',
            category: 'Food & Dining',
            date: '2025-07-03',
            time: '09:00 AM'
        },
        {
            id: '7',
            amount: 299.99,
            description: 'Online Shopping',
            category: 'Shopping',
            date: '2025-07-02',
            time: '03:20 PM'
        }
    ]);

    const categories = useMemo(() => ['Food & Dining', 'Transportation', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Other'], []);

    const handleAddExpense = useCallback(() => {
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

        // Add new expense
        const newExpense = {
            id: Date.now().toString(),
            amount: parseFloat(cost),
            description: notes,
            category: selectedCategory,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        };
        setExpenseList(prev => [newExpense, ...prev]);
        Alert.alert('Success', 'Expense added successfully');
        
        // Reset form
        setNotes('');
        setCost('');
        setSelectedCategory('');
    }, [cost, notes, selectedCategory]);

    const handleEditExpense = useCallback((expense: any) => {
        setEditFormData({
            cost: expense.amount.toString(),
            notes: expense.description,
            category: expense.category
        });
        setEditingId(expense.id);
        setEditModalVisible(true);
    }, []);

    const handleDeleteExpense = useCallback((id: string) => {
        Alert.alert(
            'Delete Expense',
            'Are you sure you want to delete this expense?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: () => {
                        setExpenseList(prev => prev.filter(item => item.id !== id));
                        Alert.alert('Success', 'Expense deleted successfully');
                    }
                }
            ]
        );
    }, []);

    const cancelEdit = useCallback(() => {
        setEditingId(null);
        setEditModalVisible(false);
        setEditFormData({ cost: '', notes: '', category: '' });
    }, []);

    const handleUpdateExpense = useCallback(() => {
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

        // Update existing expense
        setExpenseList(prev => prev.map(item => 
            item.id === editingId 
                ? { ...item, amount: parseFloat(editFormData.cost), description: editFormData.notes, category: editFormData.category }
                : item
        ));
        Alert.alert('Success', 'Expense updated successfully');
        cancelEdit();
    }, [editFormData, editingId, cancelEdit]);
    
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
                            placeholder="What did you buy?"
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
                                key={category}
                                category={category}
                                isSelected={selectedCategory === category}
                                onPress={handleCategorySelect}
                                getCategoryIcon={getCategoryIcon}
                            />
                        ))}
                    </ScrollView>
                </View>

                <TouchableOpacity style={styles.quickAddButton} onPress={handleAddExpense}>
                    <Text style={styles.quickAddButtonText}>+ Add Expense</Text>
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

                    {expenseList.map((item) => (
                        <ExpenseItem
                            key={item.id}
                            item={item}
                            getCategoryIcon={getCategoryIcon}
                            formatDate={formatDate}
                            onEdit={handleEditExpense}
                            onDelete={handleDeleteExpense}
                            editable={true}
                        />
                    ))}

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
                                        key={category}
                                        category={category}
                                        isSelected={editFormData.category === category}
                                        onPress={handleEditFormCategorySelect}
                                        getCategoryIcon={getCategoryIcon}
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
        backgroundColor: '#10b981',
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
});
