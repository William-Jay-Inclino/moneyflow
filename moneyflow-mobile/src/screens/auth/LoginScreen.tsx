import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@store/authStore';

export const LoginScreen = () => {
    const { login } = useAuthStore();

    const handleLogin = () => {
        // Simple mock login
        const mockUser = {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        login(mockUser, 'mock-token');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to MoneyFlow</Text>
            <Text style={styles.subtitle}>Track your finances with ease</Text>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#2E7D32',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#2E7D32',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
