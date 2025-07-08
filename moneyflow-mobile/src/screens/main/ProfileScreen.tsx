import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@store/authStore';

export const ProfileScreen = () => {
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>User Information</Text>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{user?.name || 'Test User'}</Text>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{user?.email || 'test@example.com'}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Account Settings</Text>
                <Text style={styles.placeholder}>• Notifications</Text>
                <Text style={styles.placeholder}>• Privacy</Text>
                <Text style={styles.placeholder}>• Security</Text>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
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
    label: {
        fontSize: 14,
        color: '#666',
        marginTop: 10,
    },
    value: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    placeholder: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    logoutButton: {
        backgroundColor: '#d32f2f',
        margin: 15,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
