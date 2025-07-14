import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    SafeAreaView, 
    Modal, 
    TextInput, 
    Alert, 
    RefreshControl, 
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { useAuthStore } from '../../store';
import { useUserAccounts } from '../../hooks/useUserAccounts';
import type { UserAccount } from '@/types';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// Simple helper to format currency without symbol
const formatBalance = (amount: any): string => {
    const num = parseFloat(amount) || 0;
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const AccountScreen = () => {
    const { logout, user } = useAuthStore();
    const {
        accounts,
        loading,
        refreshing,
        totalBalance,
        error,
        createAccount,
        updateAccount,
        deleteAccount,
        refreshAccounts,
    } = useUserAccounts();

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
    const [accountName, setAccountName] = useState('');
    const [accountBalance, setAccountBalance] = useState('');
    const [accountNotes, setAccountNotes] = useState('');
    
    // Dropdown state
    const [dropdownVisible, setDropdownVisible] = useState<string | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

    // Online/offline state
    const [isOnline, setIsOnline] = useState(true);

    React.useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            const online = state.isConnected === true && state.isInternetReachable === true;
            setIsOnline(online);
        });
        return unsubscribe;
    }, []);

    // Handle dropdown menu
    const toggleDropdown = useCallback((accountId: string, event?: any) => {
        if (dropdownVisible === accountId) {
            setDropdownVisible(null);
        } else {
            const screenWidth = Dimensions.get('window').width;
            const screenHeight = Dimensions.get('window').height;
            
            let x = screenWidth - 140;
            let y = 100;
            
            if (event && event.nativeEvent) {
                const { pageX, pageY } = event.nativeEvent;
                x = Math.min(pageX - 100, screenWidth - 140);
                y = Math.min(pageY + 10, screenHeight - 100);
            }
            
            setDropdownPosition({ x, y });
            setDropdownVisible(accountId);
        }
    }, [dropdownVisible]);

    // Open modal for adding new account
    const handleAddAccount = useCallback(() => {
        setEditingAccount(null);
        setAccountName('');
        setAccountBalance('');
        setAccountNotes('');
        setModalVisible(true);
    }, []);

    // Open modal for editing existing account
    const handleEditAccount = useCallback((account: UserAccount) => {
        setDropdownVisible(null); // Close dropdown
        setEditingAccount(account);
        setAccountName(account.name);
        setAccountBalance(account.balance.toString());
        setAccountNotes(account.notes || '');
        setModalVisible(true);
    }, []);

    // Save account (create or update)
    const handleSaveAccount = useCallback(async () => {
        if (!accountName.trim()) {
            Alert.alert('Error', 'Please enter an account name');
            return;
        }

        const balance = parseFloat(accountBalance) || 0;
        const accountData = { 
            name: accountName.trim(), 
            balance,
            notes: accountNotes.trim() || undefined, // Only send notes if not empty
        };

        let success = false;
        if (editingAccount) {
            success = await updateAccount(editingAccount.id, accountData);
        } else {
            success = await createAccount(accountData);
        }

        if (success) {
            setModalVisible(false);
            Alert.alert('Success', `Account ${editingAccount ? 'updated' : 'created'} successfully`);
        }
    }, [accountName, accountBalance, editingAccount, createAccount, updateAccount]);

    // Delete account with confirmation
    const handleDeleteAccount = useCallback((id: string) => {
        setDropdownVisible(null); // Close dropdown
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete this account?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deleteAccount(id);
                        if (success) {
                            Alert.alert('Success', 'Account deleted successfully');
                        }
                    }
                }
            ]
        );
    }, [deleteAccount]);

    // Logout with confirmation
    const handleLogout = useCallback(() => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout }
            ]
        );
    }, [logout]);

    if (!isOnline) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.customHeader}>
                    <Text style={styles.headerTitle}>Accounts</Text>
                    <Text style={styles.headerSubtitle}>{user?.email || 'User'}</Text>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
                <View style={{backgroundColor: '#fef3c7', padding: 8, borderRadius: 8, margin: 16}}>
                    <Text style={{color: '#b45309', fontSize: 13, textAlign: 'center', fontWeight: '500'}}>
                        You are offline. Accounts cannot be displayed. Please reconnect to view and manage your accounts.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.customHeader}>
                <Text style={styles.headerTitle}>Accounts</Text>
                <Text style={styles.headerSubtitle}>{user?.email || 'User'}</Text>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refreshAccounts}
                        tintColor="#6366f1"
                    />
                }
            >
                {/* Total Balance Card */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Total Balance</Text>
                    <Text style={styles.balanceAmount}>{formatBalance(totalBalance)}</Text>
                    <Text style={styles.balanceSubtext}>{accounts.length} accounts</Text>
                </View>

                {/* Add Account Button */}
                <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
                    <Text style={styles.addButtonText}>+ Add Account</Text>
                </TouchableOpacity>

                {/* Loading State */}
                {loading && !refreshing && (
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" color="#6366f1" />
                        <Text style={styles.loadingText}>Loading accounts...</Text>
                    </View>
                )}

                {/* Error State */}
                {error && (
                    <View style={styles.error}>
                        <Text style={styles.errorText}>⚠️ {error}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={refreshAccounts}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Accounts List */}
                {!loading && accounts.length === 0 && !error && (
                    <View style={styles.empty}>
                        <Text style={styles.emptyTitle}>No Accounts Yet</Text>
                        <Text style={styles.emptyText}>Add your first account to get started</Text>
                    </View>
                )}

                {accounts.map((account) => (
                    <View key={account.id} style={styles.accountCard}>
                        <View style={styles.accountInfo}>
                            <Text style={styles.accountName}>{account.name}</Text>
                            <Text style={styles.accountDate}>
                                Updated: {new Date(account.updated_at).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={styles.accountActions}>
                            <TouchableOpacity 
                                style={styles.menuButton}
                                onPress={(event) => toggleDropdown(account.id, event)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.menuButtonText}>⋮</Text>
                            </TouchableOpacity>
                            <View style={styles.balanceContainer}>
                                <Text style={styles.accountBalance}>{formatBalance(account.balance)}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Simple Modal for Add/Edit */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>
                            {editingAccount ? 'Edit Account' : 'Add Account'}
                        </Text>

                        <Text style={styles.label}>Account Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Metrobank Savings"
                            value={accountName}
                            onChangeText={setAccountName}
                        />

                        <Text style={styles.label}>Balance (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            value={accountBalance}
                            onChangeText={setAccountBalance}
                            keyboardType="numeric"
                        />

                        <Text style={styles.label}>Notes (Optional)</Text>
                        <TextInput
                            style={[styles.input, styles.notesInput]}
                            placeholder="Add notes about this account"
                            value={accountNotes}
                            onChangeText={setAccountNotes}
                            multiline={true}
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.saveButton}
                                onPress={handleSaveAccount}
                            >
                                <Text style={styles.saveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Dropdown Menu */}
            <Modal
                visible={!!dropdownVisible}
                transparent={true}
                animationType="none"
                onRequestClose={() => setDropdownVisible(null)}
            >
                <TouchableOpacity 
                    style={styles.dropdownOverlay}
                    activeOpacity={1}
                    onPress={() => setDropdownVisible(null)}
                >
                    <View style={[styles.dropdownMenu, { 
                        left: dropdownPosition.x, 
                        top: dropdownPosition.y 
                    }]}>
                        <TouchableOpacity 
                            style={styles.dropdownItem}
                            onPress={() => {
                                const account = accounts.find(a => a.id === dropdownVisible);
                                if (account) handleEditAccount(account);
                            }}
                        >
                            <Text style={styles.dropdownText}>Edit</Text>
                        </TouchableOpacity>
                        <View style={styles.dropdownDivider} />
                        <TouchableOpacity 
                            style={styles.dropdownItem}
                            onPress={() => {
                                if (dropdownVisible) handleDeleteAccount(dropdownVisible);
                            }}
                        >
                            <Text style={[styles.dropdownText, styles.deleteText]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    customHeader: {
        backgroundColor: '#6366f1',
        paddingTop: 28,
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
        marginBottom: 2,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#e0e7ff',
        opacity: 0.92,
        textAlign: 'center',
        fontWeight: '400',
        letterSpacing: 0.2,
        marginBottom: 8,
    },
    logoutButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    logoutText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    balanceCard: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 8,
    },
    balanceAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    balanceSubtext: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
    },
    addButton: {
        backgroundColor: '#f1f5f9',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
    },
    addButtonText: {
        color: '#64748b',
        fontSize: 16,
        fontWeight: '500',
    },
    loading: {
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 12,
        color: '#64748b',
    },
    error: {
        backgroundColor: '#fef2f2',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    errorText: {
        color: '#dc2626',
        marginBottom: 12,
    },
    retryButton: {
        backgroundColor: '#dc2626',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    retryText: {
        color: 'white',
        fontWeight: '500',
    },
    empty: {
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    emptyText: {
        color: '#64748b',
        textAlign: 'center',
    },
    accountCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    accountInfo: {
        flex: 1,
    },
    accountName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    accountDate: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
    },
    accountActions: {
        position: 'relative',
        alignItems: 'flex-end',
        justifyContent: 'center',
        minWidth: 120,
        minHeight: 60,
        paddingLeft: 16,
    },
    menuButton: {
        position: 'absolute',
        top: 8,
        right: 4,
        padding: 8,
        borderRadius: 8,
        minWidth: 28,
        minHeight: 28,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backgroundColor: 'transparent',
    },
    menuButtonText: {
        fontSize: 16,
        color: '#94a3b8',
        fontWeight: '600',
        letterSpacing: 0,
        lineHeight: 16,
    },
    balanceContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 40,
        paddingBottom: 8,
    },
    accountBalance: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#059669',
        textAlign: 'right',
    },
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    dropdownMenu: {
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: 8,
        paddingVertical: 4,
        minWidth: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    dropdownText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    dropdownDivider: {
        height: 1,
        backgroundColor: '#f1f5f9',
    },
    deleteText: {
        color: '#ef4444',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: 'white',
        margin: 20,
        padding: 20,
        borderRadius: 12,
        width: '90%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    notesInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        marginTop: 24,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelText: {
        color: '#6b7280',
        fontWeight: '500',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#6366f1',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveText: {
        color: 'white',
        fontWeight: '500',
    },
});
