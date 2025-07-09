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
import { API_URL } from '@env';
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
        console.log('Testing API connection...');
        console.log('API_URL from env:', API_URL);
        
        const healthCheckUrl = `${API_URL}/health-check`;
        
        try {
            setIsLoading(true);
            console.log('Testing URL:', healthCheckUrl);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch(healthCheckUrl, { 
                signal: controller.signal,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const text = await response.text();
            console.log('✅ SUCCESS with URL:', healthCheckUrl);
            console.log('Response:', text);
            
            Alert.alert(
                'Connection Test - SUCCESS ✅', 
                `URL: ${healthCheckUrl}\n\nResponse: ${text}\n\nStatus: ${response.status}`,
                [{ text: 'OK' }]
            );
            
        } catch (error: any) {
            console.log('❌ FAILED with URL:', healthCheckUrl, 'Error:', error?.message || error?.name);
            
            let errorMessage = '';
            if (error.name === 'AbortError') {
                errorMessage = 'Request timed out (10s). Check if the server is running.';
            } else if (error.message.includes('Network request failed')) {
                errorMessage = 'Network error. Check your internet connection and server availability.';
            } else {
                errorMessage = error?.message || 'Unknown error occurred';
            }
            
            Alert.alert(
                'Connection Test - FAILED ❌',
                `URL: ${healthCheckUrl}\n\nError: ${errorMessage}\n\nTroubleshooting:\n• Check if the API server is running\n• Verify the API_URL in your .env file\n• Check your internet connection`,
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
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
                    style={[styles.testButton, isLoading && styles.buttonDisabled]} 
                    onPress={testConnection}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text style={styles.testButtonText}>Test API Connection</Text>
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
