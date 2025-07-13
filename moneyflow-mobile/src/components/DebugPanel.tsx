import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store';
import { tokenUtils } from '../utils/tokenUtils';

export const DebugPanel = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [asyncStorageData, setAsyncStorageData] = useState<any>(null);
    const [tokenData, setTokenData] = useState<any>(null);
    const authState = useAuthStore();

    const loadDebugData = async () => {
        try {
            // Get all AsyncStorage data
            const authToken = await AsyncStorage.getItem('auth-token');
            const authStorage = await AsyncStorage.getItem('auth-storage');
            
            setAsyncStorageData({
                authToken: authToken ? `${authToken.substring(0, 20)}...` : null,
                authTokenLength: authToken?.length,
                authStorage: authStorage ? JSON.parse(authStorage) : null
            });

            // Get token validation data
            const validToken = await tokenUtils.getValidToken();
            const isExpired = authToken ? tokenUtils.isTokenExpired(authToken) : null;
            
            setTokenData({
                hasValidToken: !!validToken,
                isExpired,
                validTokenLength: validToken?.length
            });
        } catch (error) {
            console.error('Debug panel error:', error);
        }
    };

    useEffect(() => {
        if (isVisible) {
            loadDebugData();
        }
    }, [isVisible]);

    const clearAllData = async () => {
        Alert.alert(
            'Clear All Data',
            'This will log you out and clear all stored data. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        authState.clearAll();
                        Alert.alert('Success', 'All data cleared');
                        setIsVisible(false);
                    }
                }
            ]
        );
    };

    const testAPIConnection = async () => {
        try {
            const API_BASE_URL = 'http://192.168.1.5:7000/moneyflow/api';
            const response = await fetch(`${API_BASE_URL}/health-check`);
            const text = await response.text();
            Alert.alert('API Test', `Status: ${response.status}\nResponse: ${text}`);
        } catch (error: any) {
            Alert.alert('API Test Failed', error.message);
        }
    };

    if (!isVisible) {
        return (
            <TouchableOpacity 
                style={styles.toggleButton}
                onPress={() => setIsVisible(true)}
            >
                <Text style={styles.toggleButtonText}>🐛</Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Debug Panel</Text>
                <TouchableOpacity onPress={() => setIsVisible(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Auth Store State:</Text>
                <Text style={styles.debugText}>
                    isAuthenticated: {String(authState.isAuthenticated)}{'\n'}
                    hasUser: {String(!!authState.user)}{'\n'}
                    userEmail: {authState.user?.email || 'null'}{'\n'}
                    hasToken: {String(!!authState.token)}{'\n'}
                    tokenLength: {authState.token?.length || 0}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>AsyncStorage:</Text>
                <Text style={styles.debugText}>
                    authToken: {asyncStorageData?.authToken || 'null'}{'\n'}
                    authTokenLength: {asyncStorageData?.authTokenLength || 0}{'\n'}
                    authStorage: {JSON.stringify(asyncStorageData?.authStorage, null, 2)}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Token Validation:</Text>
                <Text style={styles.debugText}>
                    hasValidToken: {String(tokenData?.hasValidToken)}{'\n'}
                    isExpired: {String(tokenData?.isExpired)}{'\n'}
                    validTokenLength: {tokenData?.validTokenLength || 0}
                </Text>
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.button} onPress={loadDebugData}>
                    <Text style={styles.buttonText}>Refresh</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={testAPIConnection}>
                    <Text style={styles.buttonText}>Test API</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={clearAllData}>
                    <Text style={styles.buttonText}>Clear All</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    toggleButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ff6b6b',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    toggleButtonText: {
        fontSize: 20,
    },
    container: {
        position: 'absolute',
        top: 100,
        left: 10,
        right: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        maxHeight: 600,
        zIndex: 999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        fontSize: 20,
        color: '#666',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    debugText: {
        fontSize: 11,
        fontFamily: 'monospace',
        backgroundColor: '#f5f5f5',
        padding: 8,
        borderRadius: 4,
        color: '#666',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    dangerButton: {
        backgroundColor: '#ff3b30',
    },
    buttonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
});
