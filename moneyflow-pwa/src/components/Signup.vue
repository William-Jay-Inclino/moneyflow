<template>
    <div class="signup-container">
        <h1 class="signup-title">Create Account</h1>
        <p class="signup-subtitle">Join MoneyFlow to start tracking your finances</p>
        <form class="signup-form" @submit.prevent="handleSignup">
            <input
                class="signup-input"
                type="email"
                placeholder="Email"
                v-model.trim="email"
                :disabled="isLoading"
                autocomplete="username"
                required
            />
            <input
                class="signup-input"
                type="password"
                placeholder="Password (min. 6 characters)"
                v-model="password"
                :disabled="isLoading"
                autocomplete="new-password"
                required
            />
            <input
                class="signup-input"
                type="password"
                placeholder="Confirm Password"
                v-model="confirmPassword"
                :disabled="isLoading"
                autocomplete="new-password"
                required
            />
            <button
                class="signup-button"
                :class="{ disabled: isLoading }"
                type="submit"
                :disabled="isLoading"
            >
                <span v-if="isLoading" class="loader"></span>
                <span v-else>Create Account</span>
            </button>
            <div class="login-container">
                <span class="login-text">Already have an account?</span>
                <button
                    class="login-link"
                    type="button"
                    @click="navigateToLogin"
                    :disabled="isLoading"
                >Sign In</button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { authApi } from '../api';
import { useLoginStore } from '../stores/login.store';

const loginStore = useLoginStore();
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);

const emit = defineEmits(['signup', 'login', 'email-verification']);

function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string) {
    // Minimum 6 characters, at least one letter and one number (adjust as needed)
    return password.length >= 6;
}

async function handleSignup() {
    if (!email.value || !password.value || !confirmPassword.value) {
        window.alert('Please fill in all fields');
        return;
    }
    if (!validateEmail(email.value)) {
        window.alert('Please enter a valid email address');
        return;
    }
    if (!validatePassword(password.value)) {
        window.alert('Password must be at least 6 characters');
        return;
    }
    if (password.value !== confirmPassword.value) {
        window.alert('Passwords do not match');
        return;
    }
    isLoading.value = true;
    try {
        const { user } = await authApi.register({
            email: email.value.trim().toLowerCase(),
            password: password.value
        });
        
        loginStore.setPendingVerification(email.value, user.id);
        alert('Registration Successful! A verification email has been sent to your email address. Please check your email and enter the verification code.');

        emit('email-verification');

    } catch (error: any) {
        console.error('❌ [SignupScreen] Signup error:', error);
        alert('Registration Failed: ' + JSON.stringify(error));
        let errorMessage = 'An error occurred during registration';
        if (error.response?.status === 409) {
            errorMessage = 'An account with this email already exists';
        } else if (error.response?.status === 400) {
            errorMessage = error.response.data?.message || 'Please check your input and try again';
        } else if (!error.response) {
            errorMessage = 'Network error. Please check your connection';
        } else if (error.message) {
            errorMessage = error.message;
        }
        alert('Registration Failed: ' + errorMessage);
    }
    
    finally {
        isLoading.value = false;
    }
}

function navigateToLogin() {
    emit('login');
}
</script>

<style scoped>
.signup-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 24px 12px;
    background: #f5f5f5;
}
.signup-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 8px;
    color: #3b82f6;
    text-align: center;
}
.signup-subtitle {
    font-size: 1rem;
    color: #666;
    margin-bottom: 32px;
    text-align: center;
}
.signup-form {
    width: 100%;
    max-width: 340px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.signup-input {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
}
.signup-input:focus {
    border-color: #3b82f6;
}
.signup-button {
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
.signup-button.disabled,
.signup-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
}
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
}
.login-text {
    font-size: 0.95rem;
    color: #666;
}
.login-link {
    background: none;
    border: none;
    color: #3b82f6;
    font-size: 0.95rem;
    font-weight: bold;
    cursor: pointer;
    padding: 0;
}
.login-link:disabled {
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
    .signup-form {
        max-width: 100%;
    }
    .signup-container {
        padding: 16px 4px;
    }
}
</style>
