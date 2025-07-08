import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const HomeScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Dashboard</Text>
                <Text style={styles.subtitle}>Welcome back!</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Balance</Text>
                <Text style={styles.balance}>$1,234.56</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Recent Transactions</Text>
                <Text style={styles.placeholder}>No transactions yet</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Monthly Summary</Text>
                <Text style={styles.placeholder}>Income: $2,000.00</Text>
                <Text style={styles.placeholder}>Expenses: $765.44</Text>
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
    subtitle: {
        fontSize: 16,
        color: '#E8F5E8',
        marginTop: 5,
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
    balance: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    placeholder: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
});
