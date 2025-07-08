import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const HomeScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Cash Flow</Text>
                <Text style={styles.subtitle}>Your financial overview</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Balance</Text>
                <Text style={styles.balance}>1,234.56</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Recent Transactions</Text>
                <Text style={styles.placeholder}>No transactions yet</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Monthly Summary</Text>
                <Text style={styles.placeholder}>Income: 2,000.00</Text>
                <Text style={styles.placeholder}>Expenses: 765.44</Text>
            </View>
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
    card: {
        backgroundColor: 'white',
        margin: 16,
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#1e293b',
    },
    balance: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    placeholder: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 8,
    },
});
