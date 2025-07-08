import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Dimensions } from 'react-native';

export const IncomeScreen = () => {
    const [notes, setNotes] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [dropdownVisible, setDropdownVisible] = useState<string | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
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

    const categories = ['Salary', 'Freelance', 'Investments', 'Business', 'Bonus', 'Rewards', 'Other'];

    const handleAddIncome = () => {
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

        if (editingId) {
            // Update existing income
            setIncomeList(prev => prev.map(item => 
                item.id === editingId 
                    ? { ...item, amount: parseFloat(amount), description: notes, category: selectedCategory }
                    : item
            ));
            Alert.alert('Success', 'Income updated successfully');
            setEditingId(null);
        } else {
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
        }
        
        // Reset form
        setNotes('');
        setAmount('');
        setSelectedCategory('');
    };

    const handleEditIncome = (income: any) => {
        setNotes(income.description);
        setAmount(income.amount.toString());
        setSelectedCategory(income.category);
        setEditingId(income.id);
        setDropdownVisible(null);
    };

    const handleDeleteIncome = (id: string) => {
        setDropdownVisible(null);
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
    };

    const toggleDropdown = (id: string, event?: any) => {
        if (dropdownVisible === id) {
            setDropdownVisible(null);
        } else {
            // Calculate position for dropdown
            const screenWidth = Dimensions.get('window').width;
            const screenHeight = Dimensions.get('window').height;
            
            if (event && event.nativeEvent) {
                const { pageX, pageY } = event.nativeEvent;
                setDropdownPosition({ 
                    x: Math.min(pageX - 100, screenWidth - 140), 
                    y: Math.min(pageY + 10, screenHeight - 100) 
                });
            } else {
                // Fallback position
                setDropdownPosition({ x: screenWidth - 140, y: 100 });
            }
            
            setDropdownVisible(id);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setNotes('');
        setAmount('');
        setSelectedCategory('');
        setDropdownVisible(null);
    };

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

    const incomeData = incomeList;
    const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);

    return (
        <ScrollView 
            style={styles.container}
            onScrollBeginDrag={() => setDropdownVisible(null)}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Income</Text>
                <Text style={styles.subtitle}>Track your earnings</Text>
            </View>

            {/* Quick Add Form */}
            <View style={styles.quickAddForm}>
                {editingId && (
                    <View style={styles.editingHeader}>
                        <Text style={styles.editingText}>Editing Income</Text>
                        <TouchableOpacity onPress={cancelEdit} style={styles.cancelButton}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                )}
                
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
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 2 }]}>
                        <Text style={styles.inputLabel}>Notes</Text>
                        <TextInput
                            style={styles.notesInput}
                            placeholder="Source of income?"
                            value={notes}
                            onChangeText={setNotes}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                </View>

                <View style={styles.categorySection}>
                    <Text style={styles.inputLabel}>Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category}
                                style={[
                                    styles.categoryChip,
                                    selectedCategory === category && styles.categoryChipSelected
                                ]}
                                onPress={() => setSelectedCategory(category)}
                            >
                                <Text style={[
                                    styles.categoryChipText,
                                    selectedCategory === category && styles.categoryChipTextSelected
                                ]}>
                                    {getCategoryIcon(category)} {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <TouchableOpacity style={styles.quickAddButton} onPress={handleAddIncome}>
                    <Text style={styles.quickAddButtonText}>
                        {editingId ? 'Update Income' : '+ Add Income'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Income This Month</Text>
                <Text style={styles.summaryAmount}>+{totalIncome.toFixed(2)}</Text>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Income</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
            </View>

            {incomeData.map((item) => (
                <View key={item.id} style={styles.transactionCard}>
                    <View style={styles.transactionLeft}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.incomeIcon}>{getCategoryIcon(item.category)}</Text>
                        </View>
                        <View style={styles.transactionInfo}>
                            <Text style={styles.transactionDescription}>{item.description}</Text>
                            <Text style={styles.transactionCategory}>{item.category}</Text>
                            <Text style={styles.transactionDate}>{formatDate(item.date)} • {item.time}</Text>
                        </View>
                    </View>
                    <View style={styles.transactionRight}>
                        <Text style={styles.incomeAmount}>+{item.amount.toFixed(2)}</Text>
                        <View style={styles.menuContainer}>
                            <TouchableOpacity 
                                style={styles.menuButton}
                                onPress={(event) => toggleDropdown(item.id, event)}
                            >
                                <Text style={styles.menuButtonText}>⋯</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            ))}

            {/* Modal Dropdown */}
            <Modal
                visible={dropdownVisible !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setDropdownVisible(null)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setDropdownVisible(null)}
                >
                    <View style={[styles.dropdownMenu, { 
                        left: dropdownPosition.x, 
                        top: dropdownPosition.y 
                    }]}>
                        <TouchableOpacity 
                            style={styles.dropdownItem}
                            onPress={() => handleEditIncome(incomeList.find(item => item.id === dropdownVisible)!)}
                        >
                            <Text style={styles.dropdownText}>Edit</Text>
                        </TouchableOpacity>
                        <View style={styles.dropdownDivider} />
                        <TouchableOpacity 
                            style={styles.dropdownItem}
                            onPress={() => dropdownVisible && handleDeleteIncome(dropdownVisible)}
                        >
                            <Text style={[styles.dropdownText, styles.deleteText]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
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
        color: '#3b82f6',
        fontWeight: '500',
    },
    transactionCard: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginBottom: 8,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        zIndex: 1,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#ecfdf5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    incomeIcon: {
        fontSize: 24,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionDescription: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    transactionCategory: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 2,
    },
    transactionDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
    transactionRight: {
        alignItems: 'flex-end',
    },
    incomeAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#10b981',
        marginBottom: 4,
    },
    menuContainer: {
        position: 'relative',
        alignItems: 'flex-end',
        zIndex: 1000,
    },
    menuButton: {
        padding: 8,
        borderRadius: 4,
    },
    menuButtonText: {
        fontSize: 18,
        color: '#94a3b8',
        fontWeight: 'bold',
        transform: [{ rotate: '90deg' }],
    },
    dropdown: {
        position: 'absolute',
        top: 35,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 10,
        minWidth: 120,
        zIndex: 1001,
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dropdownText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    deleteText: {
        color: '#ef4444',
    },
    dropdownDivider: {
        height: 1,
        backgroundColor: '#f1f5f9',
    },
    editingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    editingText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#475569',
    },
    cancelButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    cancelButtonText: {
        color: '#64748b',
        fontSize: 14,
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
    categoryScroll: {
        marginTop: 8,
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#d1d5db',
        marginRight: 8,
        backgroundColor: '#f9fafb',
    },
    categoryChipSelected: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    categoryChipText: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
    },
    categoryChipTextSelected: {
        color: 'white',
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
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    dropdownMenu: {
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: 8,
        paddingVertical: 8,
        minWidth: 120,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
});
