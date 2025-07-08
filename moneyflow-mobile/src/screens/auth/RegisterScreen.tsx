import * as React from 'react';
const { useState } = React;
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import {
    Text,
    TextInput,
    Button,
    Card,
    ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuthStore } from '../../store';
import { authApi } from '../../services';
import { theme, spacing } from '../../theme';
import { validateEmail, validatePassword } from '../../utils';
import { AuthStackParamList } from '../../navigation/AppNavigator';

type RegisterScreenNavigationProp = StackNavigationProp<
    AuthStackParamList,
    'Register'
>;

const RegisterScreen = () => {
    const navigation = useNavigation<RegisterScreenNavigationProp>();
    const { login, setLoading, isLoading } = useAuthStore();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {
        if (!name.trim()) {
            Alert.alert('Invalid Name', 'Please enter your name');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address');
            return;
        }

        if (!validatePassword(password)) {
            Alert.alert(
                'Invalid Password',
                'Password must be at least 8 characters long'
            );
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await authApi.register({ name, email, password });
            if (response.success) {
                login(response.data.user, response.data.token);
            } else {
                Alert.alert(
                    'Registration Failed',
                    response.message || 'An error occurred'
                );
            }
        } catch (error) {
            Alert.alert(
                'Registration Failed',
                'An error occurred. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text variant="headlineLarge" style={styles.title}>
                        Create Account
                    </Text>
                    <Text variant="bodyLarge" style={styles.subtitle}>
                        Sign up to get started
                    </Text>
                </View>

                <Card style={styles.card}>
                    <Card.Content>
                        <TextInput
                            label="Full Name"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            style={styles.input}
                            mode="outlined"
                        />

                        <TextInput
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={styles.input}
                            mode="outlined"
                        />

                        <TextInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            right={
                                <TextInput.Icon
                                    icon={showPassword ? 'eye-off' : 'eye'}
                                    onPress={() =>
                                        setShowPassword(!showPassword)
                                    }
                                />
                            }
                            style={styles.input}
                            mode="outlined"
                        />

                        <TextInput
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            right={
                                <TextInput.Icon
                                    icon={
                                        showConfirmPassword ? 'eye-off' : 'eye'
                                    }
                                    onPress={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                />
                            }
                            style={styles.input}
                            mode="outlined"
                        />

                        <Button
                            mode="contained"
                            onPress={handleRegister}
                            disabled={isLoading}
                            style={styles.button}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                'Sign Up'
                            )}
                        </Button>
                    </Card.Content>
                </Card>

                <View style={styles.footer}>
                    <Text variant="bodyMedium">Already have an account?</Text>
                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('Login')}
                        style={styles.linkButton}
                    >
                        Sign In
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.md,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        marginBottom: spacing.sm,
    },
    subtitle: {
        color: theme.colors.onSurface,
        opacity: 0.7,
    },
    card: {
        marginBottom: spacing.lg,
    },
    input: {
        marginBottom: spacing.md,
    },
    button: {
        marginTop: spacing.md,
        paddingVertical: spacing.xs,
    },
    footer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    linkButton: {
        marginLeft: spacing.xs,
    },
});

export default RegisterScreen;
