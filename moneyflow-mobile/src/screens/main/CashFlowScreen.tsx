import React, { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Modal } from 'react-native';

// Year Picker Component
const YearPicker = memo(({ 
    isVisible, 
    currentYear, 
    onClose, 
    onSelect 
}: { 
    isVisible: boolean,
    currentYear: number,
    onClose: () => void,
    onSelect: (year: number) => void
}) => {
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const currentYearActual = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYearActual - 5 + i);

    const handleConfirm = () => {
        onSelect(selectedYear);
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
                    <Text style={styles.pickerTitle}>Select Year</Text>
                    
                    <View style={styles.pickerContent}>
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

// Monthly Table Header Component
const MonthlyTableHeader = memo(() => (
    <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.monthColumn]}>Month</Text>
        <Text style={[styles.tableHeaderText, styles.amountColumn]}>Income</Text>
        <Text style={[styles.tableHeaderText, styles.amountColumn]}>Expense</Text>
        <Text style={[styles.tableHeaderText, styles.amountColumn]}>Cash Flow</Text>
    </View>
));

// Monthly Table Row Component
const MonthlyTableRow = memo(({ 
    month,
    monthIndex,
    income,
    expense,
    cashFlow,
    isCurrentMonth
}: { 
    month: string,
    monthIndex: number,
    income: number,
    expense: number,
    cashFlow: number,
    isCurrentMonth: boolean
}) => (
    <View style={[
        styles.tableRow, 
        monthIndex % 2 === 1 && styles.alternateRow,
        isCurrentMonth && styles.currentMonthRow
    ]}>
        <View style={[styles.monthColumn, styles.monthCell]}>
            <Text style={[styles.monthText, isCurrentMonth && styles.currentMonthText]}>
                {month.substring(0, 3)}
            </Text>
            {isCurrentMonth && <View style={styles.currentIndicator} />}
        </View>
        
        <View style={[styles.amountColumn, styles.amountCell]}>
            <Text style={styles.incomeAmount}>+{income.toLocaleString()}</Text>
        </View>
        
        <View style={[styles.amountColumn, styles.amountCell]}>
            <Text style={styles.expenseAmount}>-{expense.toLocaleString()}</Text>
        </View>
        
        <View style={[styles.amountColumn, styles.amountCell]}>
            <Text style={[
                styles.cashFlowAmount, 
                cashFlow >= 0 ? styles.positiveCashFlow : styles.negativeCashFlow
            ]}>
                {cashFlow >= 0 ? '+' : ''}{cashFlow.toLocaleString()}
            </Text>
        </View>
    </View>
));

// Year Summary Component
const YearSummary = memo(({ 
    year,
    totalIncome,
    totalExpense,
    totalCashFlow
}: { 
    year: number,
    totalIncome: number,
    totalExpense: number,
    totalCashFlow: number
}) => (
    <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>{year} Summary</Text>
        
        <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Income</Text>
                <Text style={styles.summaryIncomeAmount}>+{totalIncome.toLocaleString()}</Text>
            </View>
            
            <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Expense</Text>
                <Text style={styles.summaryExpenseAmount}>-{totalExpense.toLocaleString()}</Text>
            </View>
            
            <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Net Cash Flow</Text>
                <Text style={[
                    styles.summaryCashFlowAmount,
                    totalCashFlow >= 0 ? styles.positiveCashFlow : styles.negativeCashFlow
                ]}>
                    {totalCashFlow >= 0 ? '+' : ''}{totalCashFlow.toLocaleString()}
                </Text>
            </View>
        </View>
    </View>
));

interface CashFlowScreenProps {
    navigation: any;
}

export const CashFlowScreen: React.FC<CashFlowScreenProps> = ({ navigation }) => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showYearPicker, setShowYearPicker] = useState(false);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Dummy data for cash flow
    const cashFlowData = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return months.map((month, index) => {
            // Generate realistic dummy data with some variation
            const baseIncome = 4000 + Math.random() * 2000;
            const baseExpense = 2500 + Math.random() * 1500;
            
            // Add seasonal variations
            const seasonalMultiplier = index === 11 ? 1.3 : (index === 5 || index === 6) ? 1.1 : 1;
            
            const income = Math.round((baseIncome * seasonalMultiplier) / 100) * 100;
            const expense = Math.round((baseExpense * seasonalMultiplier) / 100) * 100;
            const cashFlow = income - expense;
            
            return {
                month,
                monthIndex: index,
                income,
                expense,
                cashFlow,
                isCurrentMonth: selectedYear === currentYear && index === currentMonth
            };
        });
    }, [selectedYear]);

    const yearTotals = useMemo(() => {
        const totalIncome = cashFlowData.reduce((sum, month) => sum + month.income, 0);
        const totalExpense = cashFlowData.reduce((sum, month) => sum + month.expense, 0);
        const totalCashFlow = totalIncome - totalExpense;
        
        return { totalIncome, totalExpense, totalCashFlow };
    }, [cashFlowData]);

    const goToPreviousYear = useCallback(() => {
        setSelectedYear(prev => prev - 1);
    }, []);

    const goToNextYear = useCallback(() => {
        setSelectedYear(prev => prev + 1);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Cash Flow</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Year Navigation */}
                <View style={styles.yearNavigation}>
                    <TouchableOpacity 
                        style={styles.navButton}
                        onPress={goToPreviousYear}
                    >
                        <Text style={styles.navButtonText}>‹</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.yearContainer}
                        onPress={() => setShowYearPicker(true)}
                    >
                        <Text style={styles.yearText}>{selectedYear}</Text>
                        <Text style={styles.calendarIcon}>📅</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.navButton}
                        onPress={goToNextYear}
                    >
                        <Text style={styles.navButtonText}>›</Text>
                    </TouchableOpacity>
                </View>

                <YearPicker
                    isVisible={showYearPicker}
                    currentYear={selectedYear}
                    onClose={() => setShowYearPicker(false)}
                    onSelect={setSelectedYear}
                />

                {/* Year Summary */}
                <YearSummary
                    year={selectedYear}
                    totalIncome={yearTotals.totalIncome}
                    totalExpense={yearTotals.totalExpense}
                    totalCashFlow={yearTotals.totalCashFlow}
                />

                {/* Monthly Cash Flow */}
                <View style={styles.monthlySection}>
                    <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
                    
                    <View style={styles.tableContainer}>
                        <MonthlyTableHeader />
                        {cashFlowData.map((monthData, index) => (
                            <MonthlyTableRow
                                key={monthData.month}
                                month={monthData.month}
                                monthIndex={monthData.monthIndex}
                                income={monthData.income}
                                expense={monthData.expense}
                                cashFlow={monthData.cashFlow}
                                isCurrentMonth={monthData.isCurrentMonth}
                            />
                        ))}
                    </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#6366f1',
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
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
    },
    placeholder: {
        width: 40,
    },
    scrollContainer: {
        flex: 1,
    },
    yearNavigation: {
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
    yearContainer: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    yearText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
    },
    calendarIcon: {
        fontSize: 18,
        opacity: 0.7,
    },
    summaryContainer: {
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
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 20,
        textAlign: 'center',
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 8,
        fontWeight: '500',
        textAlign: 'center',
    },
    summaryIncomeAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#10b981',
        textAlign: 'center',
    },
    summaryExpenseAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ef4444',
        textAlign: 'center',
    },
    summaryCashFlowAmount: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    monthlySection: {
        marginTop: 16,
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    tableContainer: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    tableHeaderText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    alternateRow: {
        backgroundColor: '#fafbfc',
    },
    currentMonthRow: {
        backgroundColor: '#f0f9ff',
        borderLeftWidth: 4,
        borderLeftColor: '#6366f1',
    },
    monthColumn: {
        flex: 0.9,
        justifyContent: 'center',
    },
    amountColumn: {
        flex: 1.1,
        justifyContent: 'center',
    },
    monthCell: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    amountCell: {
        alignItems: 'center',
    },
    monthText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    currentMonthText: {
        color: '#6366f1',
        fontWeight: '700',
    },
    currentIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#6366f1',
    },
    incomeAmount: {
        fontSize: 13,
        fontWeight: '600',
        color: '#10b981',
    },
    expenseAmount: {
        fontSize: 13,
        fontWeight: '600',
        color: '#ef4444',
    },
    cashFlowAmount: {
        fontSize: 13,
        fontWeight: '700',
    },
    positiveCashFlow: {
        color: '#10b981',
    },
    negativeCashFlow: {
        color: '#ef4444',
    },
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
        width: '75%',
        maxHeight: '60%',
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
        padding: 16,
    },
    pickerScroll: {
        maxHeight: 250,
    },
    pickerItem: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginVertical: 2,
    },
    pickerItemSelected: {
        backgroundColor: '#6366f1',
    },
    pickerItemText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#374151',
        fontWeight: '500',
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
        color: '#6366f1',
        fontWeight: '600',
    },
});
