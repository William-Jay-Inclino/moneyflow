import React, { memo } from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';

interface CategoryChipProps {
    category: string;
    isSelected: boolean;
    onPress: (category: string) => void;
    getCategoryIcon: (category: string) => string;
    color?: string;
}

export const CategoryChip = memo<CategoryChipProps>(({ 
    category, 
    isSelected, 
    onPress, 
    getCategoryIcon,
    color = '#3b82f6'
}) => (
    <TouchableOpacity
        style={[
            styles.categoryChip,
            isSelected && [styles.categoryChipSelected, { backgroundColor: color, borderColor: color }]
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

// Grid component to show all chips in 3 rows, not slideable
interface CategoryChipGridProps {
    categories: { id: string; name: string }[];
    selectedCategory: string | null;
    onPress: (categoryId: string) => void;
    getCategoryIcon: (categoryId: string) => string;
    color?: string;
}

export const CategoryChipGrid: React.FC<CategoryChipGridProps> = ({
    categories,
    selectedCategory,
    onPress,
    getCategoryIcon,
    color = '#3b82f6',
}) => (
    <View style={gridStyles.gridContainer}>
        <View style={gridStyles.row}>
            {categories.map(cat => (
                <CategoryChip
                    key={cat.id}
                    category={cat.name}
                    isSelected={selectedCategory === cat.id}
                    onPress={() => onPress(cat.id)}
                    getCategoryIcon={() => getCategoryIcon(cat.id)}
                    color={color}
                />
            ))}
        </View>
    </View>
);

const styles = StyleSheet.create({
    categoryChip: {
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 12,
        marginRight: 6,
        marginBottom: 12,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 44,
        height: 22,
    },
    categoryChipSelected: {
        // Dynamic color will be applied inline
    },
    categoryChipText: {
        fontSize: 10,
        color: '#64748b',
        fontWeight: '500',
        textAlign: 'center',
    },
    categoryChipTextSelected: {
        color: 'white',
        fontWeight: '600',
    },
});

const gridStyles = StyleSheet.create({
    gridContainer: {
        flexDirection: 'column',
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 4,
    },
});