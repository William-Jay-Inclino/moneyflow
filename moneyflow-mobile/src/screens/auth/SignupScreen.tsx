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

    const testConnection = async () => {
        const testUrls = [
            'http://192.168.1.5:7000/moneyflow/api/health-check', // Your network IP (most likely to work)
            'http://10.0.2.2:7000/moneyflow/api/health-check',    // Android emulator
            'http://localhost:7000/moneyflow/api/health-check',     // localhost
            'http://127.0.0.1:7000/moneyflow/api/health-check'      // localhost alternative
        ];

        for (const url of testUrls) {
            try {
                console.log('Testing URL:', url);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
                
                const response = await fetch(url, { 
                    signal: controller.signal,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                clearTimeout(timeoutId);
                const text = await response.text();
                console.log('✅ SUCCESS with URL:', url);
                console.log('Response:', text);
                Alert.alert('Connection Test', `✅ Success with: ${url}\nResponse: ${text}`);
                return; // Exit on first success
            } catch (error: any) {
                console.log('❌ FAILED with URL:', url, 'Error:', error?.message || error?.name);
            }
        }
        
        Alert.alert('Connection Test', '❌ All URLs failed. Check backend and network.');
    };

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
            const user = await authApi.register({ 
                email: email.trim().toLowerCase(), 
                password 
            });
            
            // Store pending verification info
            setPendingVerification(user.email, user.id);
            
            Alert.alert(
                'Registration Successful',
                'A verification email has been sent to your email address. Please check your email and verify your account.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('EmailVerification')
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

                <TouchableOpacity 
                    style={[styles.testButton]} 
                    onPress={testConnection}
                    disabled={isLoading}
                >
                    <Text style={styles.testButtonText}>Test API Connection</Text>
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
    testButton: {
        backgroundColor: '#6b7280',
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    testButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'normal',
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
