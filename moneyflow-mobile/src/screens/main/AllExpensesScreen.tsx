import React, { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Modal, Alert, TextInput } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { ExpenseItem, CategoryChip } from '../../components';

// Month/Year Picker Component
const MonthYearPicker = memo(({ 
    isVisible, 
    currentDate, 
    onClose, 
    onSelect 
}: { 
    isVisible: boolean,
    currentDate: Date,
    onClose: () => void,
    onSelect: (date: Date) => void
}) => {
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handleConfirm = () => {
        const newDate = new Date(selectedYear, selectedMonth);
        onSelect(newDate);
        onClose();
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerTitle}>Select Month & Year</Text>
                    
                    <View style={styles.pickerContent}>
                        <View style={styles.pickerSection}>
                            <Text style={styles.pickerLabel}>Year</Text>
                            <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                                {years.map(year => (
                                    <TouchableOpacity
                                        key={year}
                                        style={[styles.pickerItem, selectedYear === year && styles.pickerItemSelected]}
                                        onPress={() => setSelectedYear(year)}
                                    >
                                        <Text style={[styles.pickerItemText, selectedYear === year && styles.pickerItemTextSelected]}>
                                            {year}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.pickerSection}>
                            <Text style={styles.pickerLabel}>Month</Text>
                            <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                                {months.map((month, index) => (
                                    <TouchableOpacity
                                        key={month}
                                        style={[styles.pickerItem, selectedMonth === index && styles.pickerItemSelected]}
                                        onPress={() => setSelectedMonth(index)}
                                    >
                                        <Text style={[styles.pickerItemText, selectedMonth === index && styles.pickerItemTextSelected]}>
                                            {month}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    <View style={styles.pickerButtons}>
                        <TouchableOpacity style={styles.pickerButtonCancel} onPress={onClose}>
                            <Text style={styles.pickerButtonCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.pickerButtonConfirm} onPress={handleConfirm}>
                            <Text style={styles.pickerButtonConfirmText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
});

// Category Legend Component
const CategoryLegend = memo(({ 
    categories, 
    getCategoryIcon 
}: { 
    categories: any[], 
    getCategoryIcon: (category: string) => string 
}) => (
    <View style={styles.categoriesContainer}>
        {categories.map((category, index) => (
            <View key={category.name} style={styles.categoryItem}>
                <View style={styles.categoryLeft}>
                    <View style={[styles.colorDot, { backgroundColor: category.color }]} />
                    <Text style={styles.categoryEmojiIcon}>{getCategoryIcon(category.name)}</Text>
                    <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <View style={styles.categoryRight}>
                    <Text style={styles.categoryAmount}>{category.legendLabel}</Text>
                    <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
                </View>
            </View>
        ))}
    </View>
));

// Total Spent Component
const TotalSpent = memo(({ 
    totalExpenses
}: { 
    totalExpenses: number
}) => (
    <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Spent This Month</Text>
        <Text style={styles.totalAmount}>{totalExpenses.toFixed(2)}</Text>
    </View>
));

interface AllExpensesScreenProps {
    navigation: any;
}

export const AllExpensesScreen: React.FC<AllExpensesScreenProps> = ({ navigation }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState({ cost: '', notes: '', category: '' });
    const [addFormData, setAddFormData] = useState({ cost: '', notes: '', category: '' });
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
        },
        {
            id: '8',
            amount: 32.50,
            description: 'Lunch',
            category: 'Food & Dining',
            date: '2025-06-28',
            time: '12:30 PM'
        },
        {
            id: '9',
            amount: 89.99,
            description: 'Monthly Internet',
            category: 'Utilities',
            date: '2025-06-25',
            time: '10:00 AM'
        },
        {
            id: '10',
            amount: 156.75,
            description: 'Clothing Store',
            category: 'Shopping',
            date: '2025-06-20',
            time: '03:45 PM'
        }
    ]);

    const categories = useMemo(() => ['Food & Dining', 'Transportation', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Other'], []);

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

    const handleAddExpense = useCallback(() => {
        if (!addFormData.cost.trim()) {
            Alert.alert('Missing Cost', 'Please enter the expense amount');
            return;
        }
        if (!addFormData.notes.trim()) {
            Alert.alert('Missing Notes', 'Please enter a description');
            return;
        }
        if (!addFormData.category) {
            Alert.alert('Missing Category', 'Please select a category');
            return;
        }

        // Create new expense with the selected month/year
        const newExpense = {
            id: Date.now().toString(),
            amount: parseFloat(addFormData.cost),
            description: addFormData.notes,
            category: addFormData.category,
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), new Date().getDate()).toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        };
        
        setExpenseList(prev => [newExpense, ...prev]);
        Alert.alert('Success', 'Expense added successfully');
        
        // Reset form and close modal
        setAddFormData({ cost: '', notes: '', category: '' });
        setAddModalVisible(false);
    }, [addFormData, currentDate]);

    const cancelAdd = useCallback(() => {
        setAddModalVisible(false);
        setAddFormData({ cost: '', notes: '', category: '' });
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

        setExpenseList(prev => prev.map(item => 
            item.id === editingId 
                ? { ...item, amount: parseFloat(editFormData.cost), description: editFormData.notes, category: editFormData.category }
                : item
        ));
        Alert.alert('Success', 'Expense updated successfully');
        cancelEdit();
    }, [editFormData, editingId]);

    const cancelEdit = useCallback(() => {
        setEditingId(null);
        setEditModalVisible(false);
        setEditFormData({ cost: '', notes: '', category: '' });
    }, []);

    const updateEditFormField = useCallback((field: string, value: string) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const updateAddFormField = useCallback((field: string, value: string) => {
        setAddFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleEditFormCategorySelect = useCallback((category: string) => {
        setEditFormData(prev => ({ ...prev, category }));
    }, []);

    const handleAddFormCategorySelect = useCallback((category: string) => {
        setAddFormData(prev => ({ ...prev, category }));
    }, []);

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

    const formatMonthYear = useCallback((date: Date) => {
        const options: Intl.DateTimeFormatOptions = { 
            month: 'long', 
            year: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }, []);

    const goToPreviousMonth = useCallback(() => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    }, []);

    const goToNextMonth = useCallback(() => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + 1);
            return newDate;
        });
    }, []);

    const filteredExpenses = useMemo(() => {
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        return expenseList.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && 
                   expenseDate.getFullYear() === currentYear;
        });
    }, [currentDate, expenseList]);

    const totalExpenses = useMemo(() => 
        filteredExpenses.reduce((sum, item) => sum + item.amount, 0), 
        [filteredExpenses]
    );

    const categoryData = useMemo(() => {
        const categoryTotals: Record<string, number> = {};
        
        filteredExpenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });

        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16'];
        
        return Object.entries(categoryTotals).map(([name, amount], index) => ({
            name,
            amount,
            color: colors[index % colors.length],
            legendLabel: `-${amount.toFixed(2)}`,
            percentage: ((amount / totalExpenses) * 100).toFixed(0)
        }));
    }, [filteredExpenses, totalExpenses]);

    const chartData = useMemo(() => 
        categoryData.map(category => ({
            name: `${category.percentage}%`,
            population: category.amount,
            color: category.color,
            legendFontColor: '#94a3b8',
            legendFontSize: 9,
        })),
        [categoryData]
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>All Expenses</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Month Navigation */}
                <View style={styles.monthNavigation}>
                    <TouchableOpacity 
                        style={styles.navButton}
                        onPress={goToPreviousMonth}
                    >
                        <Text style={styles.navButtonText}>‹</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.monthYearContainer}
                        onPress={() => setShowMonthPicker(true)}
                    >
                        <Text style={styles.monthYearText}>{formatMonthYear(currentDate)}</Text>
                        <Text style={styles.calendarIcon}>📅</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.navButton}
                        onPress={goToNextMonth}
                    >
                        <Text style={styles.navButtonText}>›</Text>
                    </TouchableOpacity>
                </View>

                <MonthYearPicker
                    isVisible={showMonthPicker}
                    currentDate={currentDate}
                    onClose={() => setShowMonthPicker(false)}
                    onSelect={setCurrentDate}
                />

                {/* Add Expense Button */}
                <View style={styles.addExpenseSection}>
                    <TouchableOpacity 
                        style={styles.addExpenseButton}
                        onPress={() => setAddModalVisible(true)}
                    >
                        <Text style={styles.addExpenseButtonText}>+ Add Expense for {formatMonthYear(currentDate)}</Text>
                    </TouchableOpacity>
                </View>

                {filteredExpenses.length > 0 ? (
                    <>
                        {/* Total Spent */}
                        <TotalSpent 
                            totalExpenses={totalExpenses}
                        />

                        {/* Chart and Analytics Section */}
                        <View style={styles.analyticsSection}>
                            <Text style={styles.sectionTitle}>Spending Breakdown</Text>
                            
                            <View style={styles.chartContainer}>
                                <PieChart
                                    data={chartData}
                                    width={Dimensions.get('window').width - 40}
                                    height={200}
                                    chartConfig={{
                                        backgroundColor: 'transparent',
                                        backgroundGradientFrom: 'transparent',
                                        backgroundGradientTo: 'transparent',
                                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                    }}
                                    accessor="population"
                                    backgroundColor="transparent"
                                    paddingLeft="15"
                                    center={[10, 10]}
                                    absolute
                                />
                            </View>

                            <CategoryLegend 
                                categories={categoryData}
                                getCategoryIcon={getCategoryIcon}
                            />
                        </View>

                        {/* Expenses List */}
                        <View style={styles.transactionsSection}>
                            <Text style={styles.sectionTitle}>All Expenses This Month</Text>
                            {filteredExpenses.map((item) => (
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
                        </View>
                    </>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateIcon}>📊</Text>
                        <Text style={styles.emptyStateText}>No expenses found for this month</Text>
                        <Text style={styles.emptyStateSubtext}>Try selecting a different month or add some expenses</Text>
                    </View>
                )}
            </ScrollView>

            {/* Edit Expense Modal */}
            <Modal
                visible={editModalVisible}
                transparent={true}
                animationType="fade"
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

            {/* Add Expense Modal */}
            <Modal
                visible={addModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={cancelAdd}
            >
                <View style={styles.editModalOverlay}>
                    <View style={styles.editModalContainer}>
                        <View style={styles.editModalHeader}>
                            <Text style={styles.editModalTitle}>Add Expense for {formatMonthYear(currentDate)}</Text>
                            <TouchableOpacity onPress={cancelAdd} style={styles.editModalCloseButton}>
                                <Text style={styles.editModalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.editFormRow}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Cost</Text>
                                <TextInput
                                    style={styles.costInput}
                                    placeholder="0.00"
                                    value={addFormData.cost}
                                    onChangeText={(text) => updateAddFormField('cost', text)}
                                    keyboardType="numeric"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 2 }]}>
                                <Text style={styles.inputLabel}>Notes</Text>
                                <TextInput
                                    style={styles.notesInput}
                                    placeholder="What did you buy?"
                                    value={addFormData.notes}
                                    onChangeText={(text) => updateAddFormField('notes', text)}
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
                                        isSelected={addFormData.category === category}
                                        onPress={handleAddFormCategorySelect}
                                        getCategoryIcon={getCategoryIcon}
                                    />
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.editModalButtons}>
                            <TouchableOpacity style={styles.editCancelButton} onPress={cancelAdd}>
                                <Text style={styles.editCancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.editUpdateButton} onPress={handleAddExpense}>
                                <Text style={styles.editUpdateButtonText}>Add Expense</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#3b82f6',
    },
    backButton: {
        padding: 8,
        borderRadius: 8,
    },
    backButtonText: {
        fontSize: 24,
        color: 'white',
        fontWeight: '600',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    placeholder: {
        width: 40,
    },
    scrollContainer: {
        flex: 1,
    },
    monthNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    navButtonText: {
        fontSize: 20,
        color: '#64748b',
        fontWeight: '600',
    },
    monthYearContainer: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    monthYearText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    calendarIcon: {
        fontSize: 16,
        opacity: 0.7,
    },
    // Total Spent Styles
    totalContainer: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 8,
        fontWeight: '500',
    },
    totalAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ef4444',
    },
    // Analytics Section Styles
    analyticsSection: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        paddingVertical: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        overflow: 'hidden',
    },
    // Category Styles
    categoriesContainer: {
        paddingHorizontal: 20,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    colorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    categoryEmojiIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        flex: 1,
    },
    categoryRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    categoryAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#dc2626',
    },
    categoryPercentage: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748b',
        minWidth: 32,
        textAlign: 'right',
    },
    // Transactions Section Styles
    transactionsSection: {
        marginTop: 16,
        paddingBottom: 20,
    },
    // Empty State Styles
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
        marginTop: 40,
    },
    emptyStateIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyStateText: {
        fontSize: 18,
        color: '#374151',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    // Month/Year Picker Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        margin: 20,
        width: '85%',
        maxHeight: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        textAlign: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    pickerContent: {
        flexDirection: 'row',
        maxHeight: 300,
    },
    pickerSection: {
        flex: 1,
        padding: 16,
    },
    pickerLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 12,
        textAlign: 'center',
    },
    pickerScroll: {
        maxHeight: 200,
    },
    pickerItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginVertical: 2,
    },
    pickerItemSelected: {
        backgroundColor: '#3b82f6',
    },
    pickerItemText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#374151',
    },
    pickerItemTextSelected: {
        color: 'white',
        fontWeight: '600',
    },
    pickerButtons: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    pickerButtonCancel: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#f1f5f9',
    },
    pickerButtonCancelText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    pickerButtonConfirm: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
    },
    pickerButtonConfirmText: {
        fontSize: 16,
        color: '#3b82f6',
        fontWeight: '600',
    },
    // Edit Modal Styles
    editModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editModalContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        margin: 20,
        width: '90%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    editModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    editModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    editModalCloseButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editModalCloseText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
    },
    editFormRow: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    inputGroup: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    costInput: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fafafa',
        color: '#1e293b',
    },
    notesInput: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fafafa',
        color: '#1e293b',
    },
    categorySection: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    helperText: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 12,
    },
    categoryScroll: {
        marginBottom: 12,
    },
    editModalButtons: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 12,
    },
    editCancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    editCancelButtonText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
    },
    editUpdateButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
    },
    editUpdateButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: '600',
    },
    // Add Expense Section Styles
    addExpenseSection: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    addExpenseButton: {
        backgroundColor: '#f8fafc',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
    },
    addExpenseButtonText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
});
