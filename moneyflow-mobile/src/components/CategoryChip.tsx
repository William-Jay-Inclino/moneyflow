import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CategoryChipProps {
    category: string;
    isSelected: boolean;
    onPress: (category: string) => void;
    getCategoryIcon: (category: string) => string;
}

export const CategoryChip = memo<CategoryChipProps>(({ 
    category, 
    isSelected, 
    onPress, 
    getCategoryIcon 
}) => (
    <TouchableOpacity
        style={[
            styles.categoryChip,
            isSelected && styles.categoryChipSelected
        ]}
        onPress={() => onPress(category)}
    >
        <Text style={[
            styles.categoryChipText,
            isSelected && styles.categoryChipTextSelected
        ]}>
            {getCategoryIcon(category)} {category}
        </Text>
    </TouchableOpacity>
));

const styles = StyleSheet.create({
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 80,
    },
    categoryChipSelected: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    categoryChipText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
        textAlign: 'center',
    },
    categoryChipTextSelected: {
        color: 'white',
        fontWeight: '600',
    },
});
