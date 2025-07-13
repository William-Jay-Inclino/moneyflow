import React, { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';

interface IncomeItemProps {
    item: {
        id: string;
        amount: number;
        description: string;
        category: string;
        categoryId: string;
        date: string;
        time: string;
        categoryName?: string;
    };
    getCategoryIcon: (category: string) => string;
    formatDate: (dateString: string) => string;
    onEdit?: (item: any) => void;
    onDelete?: (id: string) => void;
    editable?: boolean;
}

export const IncomeItem = memo<IncomeItemProps>(({ 
    item, 
    getCategoryIcon, 
    formatDate,
    onEdit,
    onDelete,
    editable = false
}) => {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

    const toggleDropdown = useCallback((event?: any) => {
        if (!editable) return;
        
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
    }, [dropdownVisible, editable]);

    const handleEdit = useCallback(() => {
        setDropdownVisible(false);
        onEdit?.(item);
    }, [item, onEdit]);

    const handleDelete = useCallback(() => {
        setDropdownVisible(false);
        onDelete?.(item.id);
    }, [item.id, onDelete]);

    // Helper to format date in MM/DD hh:mm AM/PM
    const formatIncomeDate = (isoString: string) => {
        const dateObj = new Date(isoString);
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        let hours = dateObj.getHours();
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const hh = String(hours).padStart(2, '0');
        return `${mm}/${dd} ${hh}:${minutes} ${ampm}`;
    };

    return (
        <>
            <View style={styles.transactionCard}>
                <View style={styles.transactionLeft}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.categoryIcon}>{getCategoryIcon(item.category || item.categoryName || 'Other')}</Text>
                    </View>
                    <View style={styles.transactionInfo}>
                        <Text style={styles.transactionDescription}>{item.description}</Text>
                        {/* Show formatted date only, no created_at or item.time */}
                        <Text style={styles.transactionDate}>{formatIncomeDate(item.date)}</Text>
                    </View>
                </View>
                <View style={styles.transactionRight}>
                    {editable && (
                        <TouchableOpacity 
                            style={styles.menuButton}
                            onPress={toggleDropdown}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.menuButtonText}>⋮</Text>
                        </TouchableOpacity>
                    )}
                    <View style={[styles.incomeAmountContainer, editable && { paddingRight: 40 }]}>
                        <Text style={styles.incomeAmount}>+{item.amount.toFixed(2)}</Text>
                    </View>
                </View>
            </View>

            {/* Dropdown Menu */}
            {editable && (
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
            )}
        </>
    );
});

const styles = StyleSheet.create({
    transactionCard: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginBottom: 8,
        padding: 16,
        paddingTop: 20,
        paddingRight: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
        zIndex: 1,
        minHeight: 80,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#dcfce7',
    },
    categoryIcon: {
        fontSize: 24,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionDescription: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 4,
        lineHeight: 20,
    },
    transactionDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
    transactionRight: {
        position: 'relative',
        alignItems: 'flex-end',
        justifyContent: 'center',
        minWidth: 120,
        minHeight: 60,
        paddingLeft: 16,
    },
    incomeAmountContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 40,
        paddingBottom: 8,
    },
    incomeAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#16a34a',
        textAlign: 'right',
    },
    menuButton: {
        position: 'absolute',
        top: 12,
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
});
