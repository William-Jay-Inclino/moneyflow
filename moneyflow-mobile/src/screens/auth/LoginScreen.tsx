import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    Alert,
    ActivityIndicator 
} from 'react-native';
import { useAuthStore } from '@store/authStore';
import { authApi } from '@services/api';
import { validateEmail } from '@utils/validation';

export const LoginScreen = ({ navigation }: any) => {
    const { login, setLoading, setPendingVerification } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        // Validation
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!validateEmail(email.trim())) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setLoading(true);

        try {
            console.log('🔐 Attempting JWT login...');
            const { user, accessToken } = await authApi.login({ 
                email: email.trim().toLowerCase(), 
                password 
            });
            
            console.log('✅ JWT login successful:', { userId: user.id, email: user.email });
            
            // Login with real JWT token
            login(user, accessToken);
            
        } catch (error: any) {
            console.error('❌ Login error:', error);
            
            let errorMessage = 'An error occurred during login';
            
            if (error.response?.status === 401) {
                const message = error.response.data?.message || '';
                
                if (message.includes('verify your email')) {
                    // Email not verified case
                    Alert.alert(
                        'Email Not Verified',
                        'Please verify your email address before logging in. Would you like to resend the verification code?',
                        [
                            {
                                text: 'Resend Code',
                                onPress: async () => {
                                    try {
                                        await authApi.resendVerification({
                                            email: email.trim().toLowerCase()
                                        });
                                        
                                        // Set pending verification with email only (we don't have user_id from failed login)
                                        // The EmailVerification screen will handle this case
                                        setPendingVerification(email.trim().toLowerCase(), '');
                                        
                                        Alert.alert(
                                            'Code Sent',
                                            'A verification code has been sent to your email address.',
                                            [
                                                {
                                                    text: 'OK',
                                                    onPress: () => {
                                                        navigation.navigate('EmailVerification');
                                                    }
                                                }
                                            ]
                                        );
                                    } catch (resendError: any) {
                                        console.error('Resend verification error:', resendError);
                                        let resendErrorMessage = 'Failed to resend verification code. Please try again.';
                                        
                                        if (resendError.response?.status === 400) {
                                            resendErrorMessage = resendError.response.data?.message || 'Email is already verified or user not found';
                                        }
                                        
                                        Alert.alert('Resend Failed', resendErrorMessage);
                                    }
                                }
                            },
                            {
                                text: 'Cancel',
                                style: 'cancel'
                            }
                        ]
                    );
                    return;
                } else {
                    errorMessage = 'Invalid email or password';
                }
            } else if (error.response?.status === 400) {
                errorMessage = 'Please check your input and try again';
            } else if (!error.response) {
                errorMessage = 'Network error. Please check your connection';
            }
            
            Alert.alert('Login Failed', errorMessage);
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    };

    const navigateToSignup = () => {
        navigation.navigate('Signup');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your MoneyFlow account</Text>

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
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!isLoading}
                />

                <TouchableOpacity 
                    style={[styles.button, isLoading && styles.buttonDisabled]} 
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Sign In</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={navigateToSignup} disabled={isLoading}>
                        <Text style={styles.signupLink}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        fontSize: 14,
        color: '#666',
    },
    signupLink: {
        fontSize: 14,
        color: '#3b82f6',
        fontWeight: 'bold',
    },
});
