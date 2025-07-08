import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { theme, spacing } from '../theme';

interface LoadingScreenProps {
    message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
    message = 'Loading...',
}) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="bodyLarge" style={styles.message}>
                {message}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    message: {
        marginTop: spacing.md,
        color: theme.colors.onSurface,
    },
});

export default LoadingScreen;
