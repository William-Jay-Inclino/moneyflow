import * as React from 'react';
const { useState } = React;
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
    Text,
    TextInput,
    Button,
    Card,
    Chip,
    RadioButton,
    ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useTransactionStore } from '../../store';
import { transactionApi } from '../../services';
import { theme, spacing } from '../../theme';
import { isValidAmount } from '../../utils';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Category } from '../../types';

type AddTransactionScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'AddTransaction'
>;

const AddTransactionScreen = () => {
    const navigation = useNavigation<AddTransactionScreenNavigationProp>();
    const { categories, addTransaction } = useTransactionStore();

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [isLoading, setIsLoading] = useState(false);

    const filteredCategories = categories.filter(
        (category: Category) => category.type === type
    );

    const handleSubmit = async () => {
        if (!isValidAmount(amount)) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Missing Description', 'Please enter a description');
            return;
        }

        if (!selectedCategory) {
            Alert.alert('Missing Category', 'Please select a category');
            return;
        }

        setIsLoading(true);
        try {
            const response = await transactionApi.createTransaction({
                amount: parseFloat(amount),
                description: description.trim(),
                categoryId: selectedCategory,
                date: new Date().toISOString(),
                type,
            });

            if (response.success) {
                addTransaction(response.data);
                navigation.goBack();
            } else {
                Alert.alert(
                    'Error',
                    response.message || 'Failed to create transaction'
                );
            }
        } catch (error) {
            Alert.alert(
                'Error',
                'Failed to create transaction. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Transaction Type
                    </Text>
                    <RadioButton.Group
                        onValueChange={value =>
                            setType(value as 'income' | 'expense')
                        }
                        value={type}
                    >
                        <View style={styles.radioContainer}>
                            <RadioButton.Item label="Expense" value="expense" />
                            <RadioButton.Item label="Income" value="income" />
                        </View>
                    </RadioButton.Group>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <TextInput
                        label="Amount"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        mode="outlined"
                        left={<TextInput.Icon icon="currency-usd" />}
                    />

                    <TextInput
                        label="Description"
                        value={description}
                        onChangeText={setDescription}
                        style={styles.input}
                        mode="outlined"
                        multiline
                        numberOfLines={3}
                    />
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Category
                    </Text>
                    {filteredCategories.length === 0 ? (
                        <Text variant="bodyMedium" style={styles.emptyText}>
                            No categories available for {type}. Create some
                            categories first.
                        </Text>
                    ) : (
                        <View style={styles.categoryContainer}>
                            {filteredCategories.map((category: Category) => (
                                <Chip
                                    key={category.id}
                                    mode={
                                        selectedCategory === category.id
                                            ? 'flat'
                                            : 'outlined'
                                    }
                                    selected={selectedCategory === category.id}
                                    onPress={() =>
                                        setSelectedCategory(category.id)
                                    }
                                    style={styles.categoryChip}
                                    textStyle={styles.categoryText}
                                >
                                    {category.name}
                                </Chip>
                            ))}
                        </View>
                    )}
                </Card.Content>
            </Card>

            <View style={styles.buttonContainer}>
                <Button
                    mode="outlined"
                    onPress={() => navigation.goBack()}
                    style={styles.cancelButton}
                >
                    Cancel
                </Button>
                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    disabled={isLoading}
                    style={styles.submitButton}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        'Add Transaction'
                    )}
                </Button>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: spacing.md,
    },
    card: {
        marginBottom: spacing.md,
    },
    sectionTitle: {
        marginBottom: spacing.md,
        fontWeight: 'bold',
    },
    radioContainer: {
        flexDirection: 'row',
    },
    input: {
        marginBottom: spacing.md,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    categoryChip: {
        marginBottom: spacing.sm,
    },
    categoryText: {
        fontSize: 12,
    },
    emptyText: {
        textAlign: 'center',
        opacity: 0.7,
        marginVertical: spacing.lg,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.lg,
        marginBottom: spacing.xl,
    },
    cancelButton: {
        flex: 1,
    },
    submitButton: {
        flex: 1,
    },
});

export default AddTransactionScreen;
