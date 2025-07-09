import React, { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Dimensions } from 'react-native';
import { IncomeItem, CategoryChip } from '../../components';

export const IncomeScreen = ({ navigation }: { navigation: any }) => {
    const [notes, setNotes] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editFormData, setEditFormData] = useState({ id: '', amount: '', notes: '', category: '' });
    const [showIncomeDetails, setShowIncomeDetails] = useState(false);
    const [incomeList, setIncomeList] = useState([
        {
            id: '1',
            amount: 3500.00,
            description: 'Monthly Salary',
            category: 'Salary',
            date: '2025-07-08',
            time: '09:00 AM'
        },
        {
            id: '2',
            amount: 850.00,
            description: 'Freelance Project',
            category: 'Freelance',
            date: '2025-07-06',
            time: '02:30 PM'
        },
        {
            id: '3',
            amount: 125.50,
            description: 'Investment Returns',
            category: 'Investments',
            date: '2025-07-05',
            time: '11:15 AM'
        },
        {
            id: '4',
            amount: 200.00,
            description: 'Bonus Payment',
            category: 'Bonus',
            date: '2025-07-03',
            time: '10:45 AM'
        },
        {
            id: '5',
            amount: 75.00,
            description: 'Cashback Reward',
            category: 'Rewards',
            date: '2025-07-02',
            time: '04:20 PM'
        }
    ]);

    const categories = useMemo(() => ['Salary', 'Freelance', 'Investments', 'Business', 'Bonus', 'Rewards', 'Other'], []);

    const handleAddIncome = useCallback(() => {
        if (!amount.trim()) {
            Alert.alert('Missing Amount', 'Please enter the income amount');
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

        // Add new income
        const newIncome = {
            id: Date.now().toString(),
            amount: parseFloat(amount),
            description: notes,
            category: selectedCategory,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        };
        setIncomeList(prev => [newIncome, ...prev]);
        Alert.alert('Success', 'Income added successfully');
        
        // Reset form
        setNotes('');
        setAmount('');
        setSelectedCategory('');
    }, [amount, notes, selectedCategory]);

    const handleEditIncome = useCallback((income: any) => {
        setEditFormData({
            id: income.id,
            amount: income.amount.toString(),
            notes: income.description,
            category: income.category
        });
        setEditModalVisible(true);
    }, []);

    const handleDeleteIncome = useCallback((id: string) => {
        Alert.alert(
            'Delete Income',
            'Are you sure you want to delete this income?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: () => {
                        setIncomeList(prev => prev.filter(item => item.id !== id));
                        Alert.alert('Success', 'Income deleted successfully');
                    }
                }
            ]
        );
    }, []);

    const handleSaveEdit = useCallback(() => {
        if (!editFormData.amount.trim() || !editFormData.notes.trim() || !editFormData.category) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIncomeList(prev => prev.map(item => 
            item.id === editFormData.id
                ? { ...item, amount: parseFloat(editFormData.amount), description: editFormData.notes, category: editFormData.category }
                : item
        ));
        
        setEditModalVisible(false);
        setEditFormData({ id: '', amount: '', notes: '', category: '' });
        Alert.alert('Success', 'Income updated successfully');
    }, [editFormData]);

    const handleCategorySelect = useCallback((category: string) => {
        setSelectedCategory(category);
    }, []);

    const handleScrollBeginDrag = useCallback(() => {
        // Hide any open dropdowns when scrolling starts
    }, []);

    const updateEditFormData = useCallback((field: string, value: string) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Salary': return '💼';
            case 'Freelance': return '💻';
            case 'Investments': return '📈';
            case 'Business': return '🏢';
            case 'Bonus': return '🎁';
            case 'Rewards': return '🏆';
            default: return '💰';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { 
            month: 'long', 
            day: '2-digit' 
        };
        return date.toLocaleDateString('en-US', options);
    };

    const totalIncome = useMemo(() => {
        return incomeList.reduce((sum, item) => sum + item.amount, 0);
    }, [incomeList]);

    return (
        <ScrollView 
            style={styles.container}
            onScrollBeginDrag={handleScrollBeginDrag}
        >
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
                            style={styles.amountInput}
                            placeholder="0.00"
                            value={amount}
                            onChangeText={setAmount}
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
                                key={category}
                                category={category}
                                isSelected={selectedCategory === category}
                                onPress={handleCategorySelect}
                                getCategoryIcon={getCategoryIcon}
                                color="#10b981"
                            />
                        ))}
                    </ScrollView>
                </View>

                <TouchableOpacity style={styles.quickAddButton} onPress={handleAddIncome}>
                    <Text style={styles.quickAddButtonText}>+ Add Income</Text>
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

                    {incomeList.map((item) => (
                        <IncomeItem
                            key={item.id}
                            item={item}
                            getCategoryIcon={getCategoryIcon}
                            formatDate={formatDate}
                            onEdit={handleEditIncome}
                            onDelete={handleDeleteIncome}
                            editable={true}
                        />
                    ))}

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
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity 
                            onPress={() => setEditModalVisible(false)}
                            style={styles.modalCancelButton}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Edit Income</Text>
                        <TouchableOpacity 
                            onPress={handleSaveEdit}
                            style={styles.modalSaveButton}
                        >
                            <Text style={styles.modalSaveText}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.modalFormRow}>
                            <View style={styles.modalInputGroup}>
                                <Text style={styles.modalInputLabel}>Amount</Text>
                                <TextInput
                                    style={styles.modalAmountInput}
                                    placeholder="0.00"
                                    value={editFormData.amount}
                                    onChangeText={(value) => updateEditFormData('amount', value)}
                                    keyboardType="numeric"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                            <View style={[styles.modalInputGroup, { flex: 2 }]}>
                                <Text style={styles.modalInputLabel}>Notes</Text>
                                <TextInput
                                    style={styles.modalNotesInput}
                                    placeholder="Source of income?"
                                    value={editFormData.notes}
                                    onChangeText={(value) => updateEditFormData('notes', value)}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                        </View>

                        <View style={styles.modalCategorySection}>
                            <Text style={styles.modalInputLabel}>Category</Text>
                            <Text style={styles.modalHelperText}>Select a category for this income</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalCategoryScroll}>
                                {categories.map((category) => (
                                    <CategoryChip
                                        key={category}
                                        category={category}
                                        isSelected={editFormData.category === category}
                                        onPress={(cat) => updateEditFormData('category', cat)}
                                        getCategoryIcon={getCategoryIcon}
                                        color="#10b981"
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    </ScrollView>
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
});
