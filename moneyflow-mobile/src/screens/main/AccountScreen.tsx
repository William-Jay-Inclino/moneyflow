import React, { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Modal, TextInput, Alert, Dimensions, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store';
import { useUserAccounts } from '../../hooks/useUserAccounts';
import type { UserAccount } from '@/types';

// Helper function to safely format balance
const formatBalance = (balance: any): string => {
    if (typeof balance === 'string') {
        const num = parseFloat(balance);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    }
    if (typeof balance === 'number') {
        return balance.toFixed(2);
    }
    if (balance && typeof balance === 'object' && balance.toString) {
        return parseFloat(balance.toString()).toFixed(2);
    }
    return '0.00';
};

// Account Item Component
const AccountItem = memo(({ 
    account, 
    onEdit, 
    onDelete 
}: { 
    account: UserAccount, 
    onEdit: (account: UserAccount) => void, 
    onDelete: (id: string) => void 
}) => {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

    const handleMenuPress = useCallback((event: any) => {
        if (dropdownVisible) {
            setDropdownVisible(false);
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
            setDropdownVisible(true);
        }
    }, [dropdownVisible]);

    const handleEdit = () => {
        setDropdownVisible(false);
        onEdit(account);
    };

    const handleDelete = () => {
        setDropdownVisible(false);
        onDelete(account.id);
    };

    return (
        <>
            <View style={styles.tableRow}>
                <View style={styles.nameColumn}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.lastUpdated}>last updated: {new Date(account.updated_at).toLocaleDateString()}</Text>
                </View>
                <View style={styles.balanceColumn}>
                    <Text style={styles.accountBalance}>${formatBalance(account.balance)}</Text>
                </View>
                <View style={styles.actionColumn}>
                    <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>⋮</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Dropdown Menu Modal */}
            <Modal
                visible={dropdownVisible}
                transparent={true}
                animationType="none"
                onRequestClose={() => setDropdownVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.dropdownOverlay}
                    activeOpacity={1}
                    onPress={() => setDropdownVisible(false)}
                >
                    <View style={[styles.dropdownMenu, { 
                        left: dropdownPosition.x, 
                        top: dropdownPosition.y 
                    }]}>
                        <TouchableOpacity 
                            style={styles.dropdownItem}
                            onPress={handleEdit}
                        >
                            <Text style={styles.dropdownText}>Edit</Text>
                        </TouchableOpacity>
                        <View style={styles.dropdownDivider} />
                        <TouchableOpacity 
                            style={styles.dropdownItem}
                            onPress={handleDelete}
                        >
                            <Text style={[styles.dropdownText, styles.deleteText]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
});

// Add/Edit Account Modal
const AccountModal = memo(({ 
    isVisible, 
    account, 
    onClose, 
    onSave 
}: { 
    isVisible: boolean, 
    account: UserAccount | null, 
    onClose: () => void, 
    onSave: (accountData: { name: string; balance: number }) => void 
}) => {
    const [formData, setFormData] = useState({
        name: '',
        balance: ''
    });

    // Update form data when account changes
    React.useEffect(() => {
        if (account) {
            setFormData({
                name: account.name || '',
                balance: formatBalance(account.balance).replace('$', '') || ''
            });
        } else {
            setFormData({
                name: '',
                balance: ''
            });
        }
    }, [account]);

    const handleSave = () => {
        if (!formData.name.trim()) {
            Alert.alert('Missing Name', 'Please enter an account name');
            return;
        }

        let balanceValue = 0;
        if (formData.balance.trim()) {
            balanceValue = parseFloat(formData.balance);
            if (isNaN(balanceValue) || balanceValue < 0) {
                Alert.alert('Invalid Amount', 'Please enter a valid positive amount');
                return;
            }
        }

        onSave({
            name: formData.name.trim(),
            balance: balanceValue
        });
        onClose();
    };

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {account ? 'Edit Account' : 'Add New Account'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <Text style={styles.modalCloseText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.inputLabel}>Account Name</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="example: Metrobank Savings"
                            value={formData.name}
                            onChangeText={(text) => updateField('name', text)}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.inputLabel}>Current Balance (Optional)</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="0.00 (leave empty for 0)"
                            value={formData.balance}
                            onChangeText={(text) => updateField('balance', text)}
                            keyboardType="numeric"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>
                                {account ? 'Update' : 'Add'} Account
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
});

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

    const [modalVisible, setModalVisible] = useState(false);
    const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);

    const handleAddAccount = useCallback(() => {
        setEditingAccount(null);
        setModalVisible(true);
    }, []);

    const handleEditAccount = useCallback((account: UserAccount) => {
        setEditingAccount(account);
        setModalVisible(true);
    }, []);

    const handleDeleteAccount = useCallback((id: string) => {
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

    const handleSaveAccount = useCallback(async (accountData: { name: string; balance: number }) => {
        let success = false;
        
        if (editingAccount) {
            // Update existing account
            success = await updateAccount(editingAccount.id, accountData);
            if (success) {
                Alert.alert('Success', 'Account updated successfully');
            }
        } else {
            // Add new account
            success = await createAccount(accountData);
            if (success) {
                Alert.alert('Success', 'Account added successfully');
            }
        }
        
        if (success) {
            setEditingAccount(null);
        }
    }, [editingAccount, updateAccount, createAccount]);

    const closeModal = useCallback(() => {
        setModalVisible(false);
        setEditingAccount(null);
    }, []);

    const handleLogout = useCallback(() => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Logout', 
                    style: 'destructive',
                    onPress: () => logout()
                }
            ]
        );
    }, [logout]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>Accounts</Text>
                    <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.scrollContainer} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refreshAccounts}
                        tintColor="#8b5cf6"
                        colors={["#8b5cf6"]}
                    />
                }
            >
                {/* Total Balance Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Balance</Text>
                    <Text style={styles.summaryAmount}>${totalBalance.toFixed(2)}</Text>
                    <Text style={styles.summarySubtext}>Across {accounts.length} accounts</Text>
                </View>

                {/* Loading State */}
                {loading && !refreshing && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#8b5cf6" />
                        <Text style={styles.loadingText}>Loading accounts...</Text>
                    </View>
                )}

                {/* Error State */}
                {error && !loading && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>⚠️ {error}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={refreshAccounts}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Content - only show when not loading initially */}
                {!loading && (
                    <>
                        {/* Add Account Button */}
                        <View style={styles.addAccountSection}>
                            <TouchableOpacity 
                                style={styles.addAccountButton}
                                onPress={handleAddAccount}
                            >
                                <Text style={styles.addAccountButtonText}>+ Add New Account</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Accounts List */}
                        {accounts.length > 0 ? (
                            <View style={styles.accountsSection}>
                                <Text style={styles.sectionTitle}>Your Accounts</Text>
                                
                                {/* Table Header */}
                                <View style={styles.tableHeader}>
                                    <View style={styles.nameColumn}>
                                        <Text style={styles.headerText}>Account</Text>
                                    </View>
                                    <View style={styles.balanceColumn}>
                                        <Text style={styles.headerText}>Balance</Text>
                                    </View>
                                    <View style={styles.actionColumn}>
                                        <Text style={styles.headerText}></Text>
                                    </View>
                                </View>
                                
                                {/* Table Content */}
                                <View style={styles.tableContainer}>
                                    {accounts.map((account) => (
                                        <AccountItem
                                            key={account.id}
                                            account={account}
                                            onEdit={handleEditAccount}
                                            onDelete={handleDeleteAccount}
                                        />
                                    ))}
                                </View>
                            </View>
                        ) : !loading && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateTitle}>No Accounts Yet</Text>
                                <Text style={styles.emptyStateText}>Add your first account to get started tracking your finances</Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            <AccountModal
                isVisible={modalVisible}
                account={editingAccount}
                onClose={closeModal}
                onSave={handleSaveAccount}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingHorizontal: 24,
        paddingBottom: 32,
        backgroundColor: '#8b5cf6',
    },
    headerContent: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 12,
        color: '#ddd6fe',
        opacity: 0.9,
        fontWeight: '400',
    },
    logoutButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    logoutButtonText: {
        fontSize: 12,
        color: 'white',
        fontWeight: '500',
    },
    scrollContainer: {
        flex: 1,
    },
    summaryCard: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 8,
        fontWeight: '500',
    },
    summaryAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    summarySubtext: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
    },
    addAccountSection: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    addAccountButton: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderStyle: 'dashed',
    },
    addAccountButtonText: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    accountsSection: {
        marginTop: 8,
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    tableContainer: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        alignItems: 'center',
    },
    nameColumn: {
        flex: 4,
        paddingRight: 8,
    },
    balanceColumn: {
        flex: 2,
        paddingRight: 8,
        alignItems: 'flex-end',
    },
    actionColumn: {
        flex: 1,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    accountName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    accountBalance: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#059669',
    },
    lastUpdated: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '400',
    },
    menuButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuButtonText: {
        fontSize: 16,
        color: '#94a3b8',
        fontWeight: '600',
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        margin: 20,
        width: '90%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    modalCloseButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
    },
    formSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fafafa',
        color: '#1e293b',
    },
    modalButtons: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#8b5cf6',
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: '600',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 12,
        fontWeight: '500',
    },
    errorContainer: {
        backgroundColor: '#fef2f2',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fecaca',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#dc2626',
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 12,
    },
    retryButton: {
        backgroundColor: '#dc2626',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 14,
        color: 'white',
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
    },
});
