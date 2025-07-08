import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const TransactionsScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Transactions</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Today</Text>
                <Text style={styles.placeholder}>No transactions for today</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>This Week</Text>
                <Text style={styles.placeholder}>No transactions this week</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>This Month</Text>
                <Text style={styles.placeholder}>No transactions this month</Text>
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
