import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { IncomeItem, CategoryChip } from '../../components';
import { useAuthStore, useIncomeStore } from '../../store';
import { formatCostInput } from '../../utils/costUtils';
import { formatDate, createTodayWithDay, createDateInTimezone, parseDateComponents } from '../../utils/dateUtils';
import { validateExpenseForm } from '../../utils/formValidation';

// Constants
const RECENT_INCOME_LIMIT = 10;
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

export const IncomeScreen = ({ navigation }: { navigation: any }) => {
    const { user } = useAuthStore();
    const {
        categories,
        getCurrentMonthIncomes,
        getRecentIncomes,
        getCurrentMonthTotal,
        isLoadingMonth,
        currentMonth,
        currentYear,
        loadIncomesForMonth,
        loadCategories,
        addIncome,
        updateIncome,
        deleteIncome,
        getCategoryIcon,
        updateCurrentDate,
    } = useIncomeStore();
    
    // Form state
    const [notes, setNotes] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    
    // Modal state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editFormData, setEditFormData] = useState({ amount: '', notes: '', category: '', day: '' });
    
    // UI state
    const [showIncomeDetails, setShowIncomeDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Always use current month/year - these values update automatically when date changes
    const isLoadingIncomes = isLoadingMonth(currentYear, currentMonth);
    const recentIncome = getRecentIncomes(RECENT_INCOME_LIMIT);
    const totalIncome = getCurrentMonthTotal();

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
                loadIncomesForMonth(user.id, currentYear, currentMonth)
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_LOAD);
        }
    };

    const resetForm = useCallback(() => {
        setNotes('');
        setAmount('');
        setSelectedCategory('');
    }, []);

    const resetEditForm = useCallback(() => {
        setEditingId(null);
        setEditModalVisible(false);
        setEditFormData({ amount: '', notes: '', category: '', day: '' });
    }, []);

    const handleAddIncome = useCallback(async () => {
        const validationError = validateExpenseForm(amount, notes, selectedCategory, user?.id);
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

            // Create income date using current day in Asia/Manila timezone
            const currentDay = new Date().getDate();
            const incomeDate = createTodayWithDay(currentDay);

            await addIncome(user!.id, {
                category_id: parseInt(categoryObj.id),
                amount: amount.trim(),
                notes: notes.trim(),
                income_date: incomeDate // Already in YYYY-MM-DD format
            });
            
            // Reset form
            resetForm();
            
            Alert.alert('Success', SUCCESS_MESSAGES.INCOME_ADDED);
        } catch (error) {
            console.error('Error adding income:', error);
            Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_ADD);
        } finally {
            setIsLoading(false);
        }
    }, [amount, notes, selectedCategory, user, categories, addIncome]);

    const handleEditIncome = useCallback((income: any) => {
        try {
            // Use categoryId for reliable category lookup
            const categoryObj = categories.find(cat => cat.id === income.categoryId);
            
            const { day } = parseDateComponents(income.date);
            const formData = {
                amount: income.amount.toString(),
                notes: income.description || '',
                category: categoryObj?.id?.toString() || '',
                day: day.toString()
            };
            
            setEditFormData(formData);
            setEditingId(income.id);
            setEditModalVisible(true);
        } catch (error) {
            console.error('Error preparing income for editing:', error);
            Alert.alert('Error', 'Unable to edit this income. Please try again.');
        }
    }, [categories]);

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
                            await deleteIncome(user.id, id);
                            Alert.alert('Success', SUCCESS_MESSAGES.INCOME_DELETED);
                        } catch (error) {
                            console.error('Error deleting income:', error);
                            Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_DELETE);
                        }
                    }
                }
            ]
        );
    }, [user, deleteIncome]);

    const handleUpdateIncome = useCallback(async () => {
        const validationError = validateExpenseForm(editFormData.amount, editFormData.notes, editFormData.category, user?.id);
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
                const { month, year } = parseDateComponents(originalIncome.date);
                incomeDate = createDateInTimezone(year, month, parseInt(editFormData.day));
            } else {
                // Fallback to current month/year if original income not found
                incomeDate = createTodayWithDay(parseInt(editFormData.day));
            }

            await updateIncome(user!.id, editingId, {
                category_id: parseInt(categoryObj.id),
                amount: editFormData.amount.trim(),
                notes: editFormData.notes.trim(),
                income_date: incomeDate // Already in YYYY-MM-DD format
            });
            
            Alert.alert('Success', SUCCESS_MESSAGES.INCOME_UPDATED);
            resetEditForm();
        } catch (error) {
            console.error('Error updating income:', error);
            Alert.alert('Error', ERROR_MESSAGES.FAILED_TO_UPDATE);
        }
    }, [editFormData, editingId, user, categories, updateIncome]);

    const updateEditFormField = useCallback((field: string, value: string) => {
        if (field === 'amount') {
            setEditFormData(prev => ({ ...prev, [field]: formatCostInput(value) }));
        } else {
            setEditFormData(prev => ({ ...prev, [field]: value }));
        }
    }, []);

    const handleAmountChange = useCallback((value: string) => {
        setAmount(formatCostInput(value));
    }, []);

    const cancelEdit = () => {
        resetEditForm();
    };    

    const formatDateForDisplay = useCallback((dateString: string) => {
        return formatDate(dateString);
    }, []);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Add Income</Text>
                <Text style={styles.subtitle}>Quick and easy income tracking</Text>
            </View>

            {/* Quick Add Form */}
            <View style={styles.quickAddForm}>
                <View style={styles.formRow}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Amount</Text>
                        <TextInput
                            style={styles.costInput}
                            placeholder="0.00"
                            value={amount}
                            onChangeText={handleAmountChange}
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
                                isSelected={selectedCategory === category.id.toString()}
                                onPress={() => setSelectedCategory(category.id.toString())}
                                getCategoryIcon={getCategoryIcon}
                                color="#10b981"
                            />
                        ))}
                    </ScrollView>
                </View>

                <TouchableOpacity 
                    style={[styles.quickAddButton, isLoading && { opacity: 0.6 }]} 
                    onPress={handleAddIncome}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text style={styles.quickAddButtonText}>+ Add Income</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Toggle Button for Income Details - Only show when details are hidden */}
            {!showIncomeDetails && (
                <View style={styles.toggleSection}>
                    <TouchableOpacity 
                        style={styles.toggleButton} 
                        onPress={() => setShowIncomeDetails(!showIncomeDetails)}
                    >
                        <Text style={styles.toggleButtonText}>
                            View Income Details
                        </Text>
                        <Text style={styles.toggleIcon}>
                            ▼
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Collapsible Income Details */}
            {showIncomeDetails && (
                <>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Total Income This Month</Text>
                        <Text style={styles.summaryAmount}>+{totalIncome.toFixed(2)}</Text>
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Income</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('AllIncome')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoadingIncomes ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#10b981" />
                            <Text style={styles.loadingText}>Loading income...</Text>
                        </View>
                    ) : recentIncome.length > 0 ? (
                        recentIncome.map((item) => (
                            <IncomeItem
                                key={item.id}
                                item={item}
                                getCategoryIcon={getCategoryIcon}
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
                            <TouchableOpacity onPress={cancelEdit} style={styles.editModalCloseButton}>
                                <Text style={styles.editModalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.editFormRow}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Amount</Text>
                                <TextInput
                                    style={styles.costInput}
                                    placeholder="0.00"
                                    value={editFormData.amount}
                                    onChangeText={(text) => updateEditFormField('amount', text)}
                                    keyboardType="numeric"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 2 }]}>
                                <Text style={styles.inputLabel}>Notes</Text>
                                <TextInput
                                    style={styles.notesInput}
                                    placeholder="Source of income?"
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
                                        isSelected={editFormData.category === category.id.toString()}
                                        onPress={() => setEditFormData(prev => ({ ...prev, category: category.id.toString() }))}
                                        getCategoryIcon={getCategoryIcon}
                                        color="#10b981"
                                    />
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.daySection}>
                            <Text style={styles.inputLabel}>Day</Text>
                            <Text style={styles.helperText}>Select the day of the month for this income</Text>
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
                            <TouchableOpacity style={styles.editUpdateButton} onPress={handleUpdateIncome}>
                                <Text style={styles.editUpdateButtonText}>Update Income</Text>
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
        backgroundColor: '#10b981',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#d1fae5',
        opacity: 0.9,
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
        color: '#6b7280',
        marginBottom: 8,
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
    // Toggle Section
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
        color: '#10b981',
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
        color: '#10b981',
        fontWeight: '500',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalCancelButton: {
        padding: 8,
    },
    modalCancelText: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '500',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    modalSaveButton: {
        padding: 8,
    },
    modalSaveText: {
        fontSize: 16,
        color: '#10b981',
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    modalFormRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    modalInputGroup: {
        flex: 1,
    },
    modalInputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
    },
    modalAmountInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'white',
    },
    modalNotesInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'white',
    },
    modalCategorySection: {
        marginBottom: 20,
    },
    modalHelperText: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    modalCategoryScroll: {
        marginTop: 8,
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
    daySection: {
        marginBottom: 20,
    },
    dayScroll: {
        marginBottom: 12,
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
        backgroundColor: '#10b981',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    editUpdateButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    dayChip: {
        backgroundColor: '#d1fae5',
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#10b981',
    },
    dayChipSelected: {
        backgroundColor: '#10b981',
        borderColor: '#059669',
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
