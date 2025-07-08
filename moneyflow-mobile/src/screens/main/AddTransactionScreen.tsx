import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';

export const AddTransactionScreen = () => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');

    const mockCategories = [
        { id: '1', name: 'Food', type: 'expense' },
        { id: '2', name: 'Transportation', type: 'expense' },
        { id: '3', name: 'Salary', type: 'income' },
        { id: '4', name: 'Freelance', type: 'income' },
    ];

    const filteredCategories = mockCategories.filter(
        category => category.type === type
    );

    const handleSubmit = () => {
        if (!amount.trim()) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Missing Description', 'Please enter a description');
            return;
        }

        if (!selectedCategory) {
            Alert.alert('Missing Category', 'Please select a category');
            return;
        }

        Alert.alert('Success', `Transaction of $${amount} added!`);
        // In a real app, this would save to the store/API
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Add Transaction</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Transaction Type</Text>
                <View style={styles.radioContainer}>
                    <TouchableOpacity
                        style={[
                            styles.radioButton,
                            type === 'expense' && styles.radioButtonSelected
                        ]}
                        onPress={() => setType('expense')}
                    >
                        <Text style={[
                            styles.radioText,
                            type === 'expense' && styles.radioTextSelected
                        ]}>Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.radioButton,
                            type === 'income' && styles.radioButtonSelected
                        ]}
                        onPress={() => setType('income')}
                    >
                        <Text style={[
                            styles.radioText,
                            type === 'income' && styles.radioTextSelected
                        ]}>Income</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Transaction Details</Text>
                <Text style={styles.placeholder}>Amount: Enter amount here</Text>
                <Text style={styles.placeholder}>Description: Enter description here</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Category</Text>
                {filteredCategories.length === 0 ? (
                    <Text style={styles.emptyText}>
                        No categories available for {type}. Create some categories first.
                    </Text>
                ) : (
                    <View style={styles.categoryContainer}>
                        {filteredCategories.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.categoryChip,
                                    selectedCategory === category.id && styles.categoryChipSelected
                                ]}
                                onPress={() => setSelectedCategory(category.id)}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    selectedCategory === category.id && styles.categoryTextSelected
                                ]}>
                                    {category.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Add Transaction</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        backgroundColor: '#2E7D32',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
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
    radioContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    radioButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    radioButtonSelected: {
        backgroundColor: '#2E7D32',
        borderColor: '#2E7D32',
    },
    radioText: {
        color: '#666',
    },
    radioTextSelected: {
        color: 'white',
    },
    placeholder: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
        fontStyle: 'italic',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryChip: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 5,
    },
    categoryChipSelected: {
        backgroundColor: '#2E7D32',
        borderColor: '#2E7D32',
    },
    categoryText: {
        fontSize: 14,
        color: '#666',
    },
    categoryTextSelected: {
        color: 'white',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        fontStyle: 'italic',
        marginVertical: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 15,
        margin: 15,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: 'bold',
    },
    submitButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 8,
        backgroundColor: '#2E7D32',
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
