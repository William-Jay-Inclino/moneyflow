<template>
    <div class="login-container">
        <h1 class="login-title">Welcome Back</h1>
        <p class="login-subtitle">Sign in to your MoneyFlow account</p>
        <form class="login-form" @submit.prevent="handleLogin">
            <input
                class="login-input"
                type="email"
                placeholder="Email"
                v-model.trim="email"
                :disabled="isLoading"
                autocomplete="username"
                required
            />
            <input
                class="login-input"
                type="password"
                placeholder="Password"
                v-model="password"
                :disabled="isLoading"
                autocomplete="current-password"
                required
            />

            <button
                class="login-button"
                :class="{ disabled: isLoading }"
                type="submit"
                :disabled="isLoading"
            >
                <span v-if="isLoading" class="loader"></span>
                <span v-else>Sign In</span>
            </button>
            <div class="signup-container">
                <span class="signup-text">Don't have an account?</span>
                <button
                    class="signup-link"
                    type="button"
                    @click="navigateToSignup"
                    :disabled="isLoading"
                >Sign Up</button>
            </div>
            <div class="signup-container">
                <span class="signup-text">Forgot password?</span>
                <button
                    class="signup-link"
                    type="button"
                    @click="navigateToForgotPassword"
                    :disabled="isLoading"
                >Click here</button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { authApi } from '../api';
import { useAuthStore } from '../stores/auth.store';
import { useLoginStore } from '../stores/login.store';
import { showErrorAlert, showInfoAlert } from '../utils/swal';

const authStore = useAuthStore();
const loginStore = useLoginStore();
const email = ref('');
const password = ref('');
const isLoading = ref(false);

const emit = defineEmits(['login', 'signup', 'forgot-password', 'email-verification']);

function validateEmail(email: string) {
    // Simple email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleLogin() {
    if (!email.value || !password.value) {
        showErrorAlert({
            title: 'Missing Fields',
            text: 'Please fill in all fields'
        });
        return;
    }
    if (!validateEmail(email.value)) {
        showErrorAlert({
            title: 'Invalid Email',
            text: 'Please enter a valid email address'
        });
        return;
    }
    isLoading.value = true;
    try {

        const { user, accessToken } = await authApi.login({ 
            email: email.value.trim().toLowerCase(), 
            password: password.value
        });

        authStore.setAuthUser({
            user_id: user.id,
            email: user.email,
            token: accessToken
        });

    } catch (error: any) {
        console.error('Login error:', error);
        
        const errorMessage = error.response?.data?.message || 'An error occurred during login';
        
        if (errorMessage === 'Please verify your email address') {
            try {
                // Get user ID and redirect to verification
                const { userId } = await authApi.getUserIdByEmail(email.value.trim().toLowerCase());
                loginStore.setPendingVerification(email.value.trim().toLowerCase(), userId);
                
                showInfoAlert({
                    title: 'Email Not Verified',
                    text: 'Redirecting to email verification...'
                });
                
                // Small delay for user to see the message
                setTimeout(() => {
                    emit('email-verification');
                }, 1000);
            } catch (err) {
                console.error('Error getting user ID:', err);
                showErrorAlert({
                    title: 'Error',
                    text: 'Unable to redirect to verification. Please try again.'
                });
            }
        } else if (errorMessage === 'Invalid email or password') {
            showErrorAlert({
                title: 'Login Failed',
                text: 'Invalid email or password. Please try again.'
            });
        } else {
            showErrorAlert({
                title: 'Login Failed',
                text: errorMessage
            });
        }
    } finally {
        isLoading.value = false;
    }
}

function navigateToSignup() {
    emit('signup');
}
function navigateToForgotPassword() {
    emit('forgot-password');
}
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 24px 12px;
    background: #f5f5f5;
}
.login-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 8px;
    color: #3b82f6;
    text-align: center;
}
.login-subtitle {
    font-size: 1rem;
    color: #666;
    margin-bottom: 32px;
    text-align: center;
}
.login-form {
    width: 100%;
    max-width: 340px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.login-input {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
}
.login-input:focus {
    border-color: #3b82f6;
}
.login-button {
    background: #3b82f6;
    color: #fff;
    font-size: 1rem;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    padding: 14px 0;
    cursor: pointer;
    margin-bottom: 12px;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}
.login-button.disabled,
.login-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
}
.signup-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
}
.signup-text {
    font-size: 0.95rem;
    color: #666;
}
.signup-link {
    background: none;
    border: none;
    color: #3b82f6;
    font-size: 0.95rem;
    font-weight: bold;
    cursor: pointer;
    padding: 0;
}
.signup-link:disabled {
    color: #9ca3af;
    cursor: not-allowed;
}
.loader {
    width: 20px;
    height: 20px;
    border: 2px solid #fff;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: inline-block;
}
@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 480px) {
    .login-form {
        max-width: 100%;
    }
    .login-container {
        padding: 16px 4px;
    }
}
</style>
