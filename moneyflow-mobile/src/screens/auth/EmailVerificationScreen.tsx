import React, { useState, useEffect } from 'react';
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

export const EmailVerificationScreen = ({ navigation }: any) => {
    const { 
        pendingVerificationEmail, 
        pendingVerificationUserId, 
        login, 
        clearPendingVerification,
        setLoading 
    } = useAuthStore();
    
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendCounter, setResendCounter] = useState(0);
    const [canResend, setCanResend] = useState(true);

    useEffect(() => {
        // If no pending verification email, redirect to login
        if (!pendingVerificationEmail) {
            navigation.navigate('Login');
        }
    }, [pendingVerificationEmail, navigation]);

    const handleVerifyEmail = async () => {
        if (!verificationCode.trim()) {
            Alert.alert('Error', 'Please enter the verification code');
            return;
        }

        if (!pendingVerificationEmail) {
            Alert.alert('Error', 'Verification session expired. Please try again.');
            navigation.navigate('Login');
            return;
        }

        setIsLoading(true);
        setLoading(true);

        try {
            console.log('✉️ Attempting email verification...');
            console.log('Email:', pendingVerificationEmail);
            console.log('Code:', verificationCode.trim());
            
            // Always use the new JWT auth API for verification
            const user = await authApi.verifyEmail({
                email: pendingVerificationEmail,
                code: verificationCode.trim()
            });
            
            // After successful verification, fetch and store global categories, enable all by default
            try {
                const { categoryApi } = await import('@services/api');
                const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
                // Fetch global categories
                const [incomeCategories, expenseCategories] = await Promise.all([
                    categoryApi.getAllCategories('INCOME'),
                    categoryApi.getAllCategories('EXPENSE'),
                ]);
                // Transform and enable all by default
                const transformedIncome = incomeCategories.map((cat: any) => ({
                    id: cat.id?.toString() || '',
                    name: cat.name || 'Unknown',
                    icon: cat.icon || '💰',
                    enabled: true,
                    type: 'INCOME'
                }));
                const transformedExpense = expenseCategories.map((cat: any) => ({
                    id: cat.id?.toString() || '',
                    name: cat.name || 'Unknown',
                    icon: cat.icon || '💸',
                    enabled: true,
                    type: 'EXPENSE'
                }));
                // Save global categories
                await AsyncStorage.setItem('global_income_categories', JSON.stringify(transformedIncome));
                await AsyncStorage.setItem('global_expense_categories', JSON.stringify(transformedExpense));
                // Enable all for user
                if (user?.id) {
                    await AsyncStorage.setItem(`user_income_categories_${user.id}`, JSON.stringify(transformedIncome.map(cat => cat.id)));
                    await AsyncStorage.setItem(`user_expense_categories_${user.id}`, JSON.stringify(transformedExpense.map(cat => cat.id)));
                }
            } catch (catError) {
                console.error('Error initializing categories after verification:', catError);
            }
            
            console.log('✅ Email verification successful');
            clearPendingVerification();
            
            // Get a fresh JWT token by logging in again (since verification changes user state)
            Alert.alert(
                'Email Verified!',
                'Your email has been successfully verified. Please log in again to continue.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.navigate('Login');
                        }
                    }
                ]
            );
            
        } catch (error: any) {
            console.error('❌ Email verification error:', error);
            console.error('❌ Error response:', error.response?.data);
            console.error('❌ Error status:', error.response?.status);
            
            let errorMessage = 'An error occurred during verification';
            
            if (error.response?.status === 400) {
                errorMessage = error.response.data?.message || 'Invalid verification code';
                console.error('❌ Backend error message:', error.response.data?.message);
            } else if (!error.response) {
                errorMessage = 'Network error. Please check your connection';
            }
            
            Alert.alert('Verification Failed', errorMessage);
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!pendingVerificationEmail) {
            Alert.alert('Error', 'No email address found. Please sign up again.');
            navigation.navigate('Signup');
            return;
        }

        if (!canResend) {
            Alert.alert('Please Wait', `You can resend the code in ${resendCounter} seconds.`);
            return;
        }

        setIsResending(true);

        try {
            await authApi.resendVerification({
                email: pendingVerificationEmail
            });
            
            Alert.alert(
                'Code Sent',
                'A new verification code has been sent to your email address.'
            );

            // Start countdown timer (60 seconds)
            setCanResend(false);
            setResendCounter(60);
            
            const countdown = setInterval(() => {
                setResendCounter((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdown);
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
        } catch (error: any) {
            console.error('Resend verification error:', error);
            
            let errorMessage = 'Failed to resend verification code';
            
            if (error.response?.status === 400) {
                errorMessage = error.response.data?.message || 'Email is already verified';
            } else if (!error.response) {
                errorMessage = 'Network error. Please check your connection';
            }
            
            Alert.alert('Resend Failed', errorMessage);
        } finally {
            setIsResending(false);
        }
    };

    const handleBackToSignup = () => {
        clearPendingVerification();
        // If we came from login (no user_id), go back to login
        // If we came from signup (with user_id), go back to signup
        if (pendingVerificationUserId) {
            navigation.navigate('Signup');
        } else {
            navigation.navigate('Login');
        }
    };

    if (!pendingVerificationEmail) {
        return null; // Will redirect via useEffect
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
                We've sent a verification code to:{'\n'}
                <Text style={styles.email}>{pendingVerificationEmail}</Text>
            </Text>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                />

                <TouchableOpacity 
                    style={[styles.button, isLoading && styles.buttonDisabled]} 
                    onPress={handleVerifyEmail}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Verify Email</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[
                        styles.secondaryButton, 
                        (isResending || isLoading || !canResend) && styles.buttonDisabled
                    ]} 
                    onPress={handleResendCode}
                    disabled={isResending || isLoading || !canResend}
                >
                    {isResending ? (
                        <ActivityIndicator color="#3b82f6" />
                    ) : (
                        <Text style={styles.secondaryButtonText}>
                            {canResend ? 'Resend Code' : `Resend in ${resendCounter}s`}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={handleBackToSignup}
                    disabled={isLoading}
                >
                    <Text style={styles.backButtonText}>
                        {pendingVerificationUserId ? 'Back to Sign Up' : 'Back to Login'}
                    </Text>
                </TouchableOpacity>
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
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
        textAlign: 'center',
        lineHeight: 24,
    },
    email: {
        fontWeight: 'bold',
        color: '#3b82f6',
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
        textAlign: 'center',
        letterSpacing: 2,
    },
    button: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#3b82f6',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    secondaryButtonText: {
        color: '#3b82f6',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        alignItems: 'center',
        paddingVertical: 15,
    },
    backButtonText: {
        color: '#666',
        fontSize: 14,
    },
});
