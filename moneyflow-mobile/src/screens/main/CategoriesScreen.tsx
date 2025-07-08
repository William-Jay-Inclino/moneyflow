import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const CategoriesScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Categories</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Income Categories</Text>
                <Text style={styles.placeholder}>• Salary</Text>
                <Text style={styles.placeholder}>• Freelance</Text>
                <Text style={styles.placeholder}>• Investments</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Expense Categories</Text>
                <Text style={styles.placeholder}>• Food & Dining</Text>
                <Text style={styles.placeholder}>• Transportation</Text>
                <Text style={styles.placeholder}>• Entertainment</Text>
                <Text style={styles.placeholder}>• Utilities</Text>
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
    placeholder: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
});
