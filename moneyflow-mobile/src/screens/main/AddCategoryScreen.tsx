import * as React from 'react';
const { useState } = React;
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
    Text,
    TextInput,
    Button,
    Card,
    RadioButton,
    ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useTransactionStore } from '../../store';
import { categoryApi } from '../../services';
import { theme, spacing } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';

type AddCategoryScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'AddCategory'
>;

const AddCategoryScreen = () => {
    const navigation = useNavigation<AddCategoryScreenNavigationProp>();
    const { addCategory } = useTransactionStore();

    const [name, setName] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Missing Name', 'Please enter a category name');
            return;
        }

        setIsLoading(true);
        try {
            const response = await categoryApi.createCategory({
                name: name.trim(),
                icon: type === 'income' ? 'plus-circle' : 'minus-circle',
                color:
                    type === 'income'
                        ? theme.colors.primary
                        : theme.colors.error,
                type,
            });

            if (response.success) {
                addCategory(response.data);
                navigation.goBack();
            } else {
                Alert.alert(
                    'Error',
                    response.message || 'Failed to create category'
                );
            }
        } catch (error) {
            Alert.alert(
                'Error',
                'Failed to create category. Please try again.'
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
                        Category Type
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
                        label="Category Name"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        mode="outlined"
                        placeholder="e.g., Food, Salary, Entertainment"
                    />
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
                        'Add Category'
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

export default AddCategoryScreen;
