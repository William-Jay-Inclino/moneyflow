import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    Alert,
    ActivityIndicator,
    ScrollView 
} from 'react-native';
import { useAuthStore } from '@store/authStore';
import { authApi } from '@services/api';
import { validateEmail, validatePassword, formatValidationErrors } from '@utils/validation';

export const SignupScreen = ({ navigation }: any) => {
    const { setPendingVerification, setLoading } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);



    const handleSignup = async () => {
        // Basic validation
        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Email validation
        if (!validateEmail(email.trim())) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        // Password validation
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            Alert.alert('Password Error', formatValidationErrors(passwordValidation.errors));
            return;
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        setLoading(true);

        try {
            console.log('📝 Attempting JWT registration...');
            const { user, accessToken } = await authApi.register({ 
                email: email.trim().toLowerCase(), 
                password 
            });
            
            console.log('✅ JWT registration successful:', { userId: user.id, email: user.email });
            
            // Store pending verification info (user is registered but may need email verification)
            setPendingVerification(user.email, user.id);
            
            Alert.alert(
                'Registration Successful',
                'A verification email has been sent to your email address. You can start using the app, but please verify your email for full access.',
                [
                    {
                        text: 'Verify Email',
                        onPress: () => navigation.navigate('EmailVerification')
                    },
                    {
                        text: 'Continue',
                        onPress: () => {
                            // Log the user in even if email is not verified
                            const { login } = useAuthStore.getState();
                            login(user, accessToken);
                        }
                    }
                ]
            );
            
        } catch (error: any) {
            console.error('Signup error:', error);
            
            let errorMessage = 'An error occurred during registration';
            
            if (error.response?.status === 409) {
                errorMessage = 'An account with this email already exists';
            } else if (error.response?.status === 400) {
                errorMessage = error.response.data?.message || 'Please check your input and try again';
            } else if (!error.response) {
                errorMessage = 'Network error. Please check your connection';
            }
            
            Alert.alert('Registration Failed', errorMessage);
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    };

    const navigateToLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join MoneyFlow to start tracking your finances</Text>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                />
                
                <TextInput
                    style={styles.input}
                    placeholder="Password (min. 6 characters)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!isLoading}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    editable={!isLoading}
                />

                <TouchableOpacity 
                    style={[styles.button, isLoading && styles.buttonDisabled]} 
                    onPress={handleSignup}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Create Account</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <TouchableOpacity onPress={navigateToLogin} disabled={isLoading}>
                        <Text style={styles.loginLink}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#3b82f6',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
        textAlign: 'center',
    },
    form: {
        width: '100%',
        maxWidth: 320,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: 14,
        color: '#666',
    },
    loginLink: {
        fontSize: 14,
        color: '#3b82f6',
        fontWeight: 'bold',
    },
});
