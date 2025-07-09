import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
} from 'react-native';

export const AddCategoryScreen = () => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');

    const handleSubmit = () => {
        if (!name.trim()) {
            Alert.alert('Missing Name', 'Please enter a category name');
            return;
        }

        Alert.alert('Success', `Category "${name}" created!`);
        // In a real app, this would save to the store/API
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Add Category</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Category Type</Text>
                <View style={styles.radioContainer}>
                    <TouchableOpacity
                        style={[
                            styles.radioButton,
                            type === 'expense' && styles.radioButtonSelected,
                        ]}
                        onPress={() => setType('expense')}
                    >
                        <Text
                            style={[
                                styles.radioText,
                                type === 'expense' && styles.radioTextSelected,
                            ]}
                        >
                            Expense
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.radioButton,
                            type === 'income' && styles.radioButtonSelected,
                        ]}
                        onPress={() => setType('income')}
                    >
                        <Text
                            style={[
                                styles.radioText,
                                type === 'income' && styles.radioTextSelected,
                            ]}
                        >
                            Income
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Category Name</Text>
                <Text style={styles.placeholder}>Enter category name here</Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                >
                    <Text style={styles.submitButtonText}>Add Category</Text>
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
        fontSize: 28,
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
        fontStyle: 'italic',
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
