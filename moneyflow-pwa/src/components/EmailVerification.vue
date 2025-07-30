<template>
    <div class="verify-container">
        <h1 class="verify-title">Verify Your Email</h1>
        <p class="verify-subtitle">
            <template v-if="email">
                We've sent a verification code to:<br />
                <span class="verify-email">{{ email }}</span>
            </template>
            <template v-else>
                No email address provided.
            </template>
        </p>
        <form class="verify-form" @submit.prevent="handleVerify">
            <input
                class="verify-input"
                type="text"
                placeholder="Enter verification code"
                v-model.trim="code"
                :disabled="isLoading || !email"
                maxlength="8"
                required
                autocomplete="one-time-code"
            />
            <button
                class="verify-button"
                :class="{ disabled: isLoading || !email }"
                type="submit"
                :disabled="isLoading || !email"
            >
                <span v-if="isLoading" class="loader"></span>
                <span v-else>Verify Email</span>
            </button>
            <button
                class="resend-button"
                type="button"
                @click="handleResend"
                :disabled="isResending || isLoading || !canResend || !email"
            >
                <span v-if="isResending" class="loader loader-blue"></span>
                <span v-else>
                    {{ canResend ? 'Resend Code' : `Resend in ${resendCounter}s` }}
                </span>
            </button>
            <button
                class="back-button"
                type="button"
                @click="handleBack"
                :disabled="isLoading"
            >
                {{ hasUserId ? 'Back to Sign Up' : 'Back to Login' }}
            </button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { authApi } from '../api';
import { useLoginStore } from '../stores/login.store';  

const loginStore = useLoginStore();

const props = defineProps<{
    email: string | null;
    userId?: string | null;
}>();

const emit = defineEmits(['signup', 'login']);

const code = ref('');
const isLoading = ref(false);
const isResending = ref(false);
const resendCounter = ref(0);
const canResend = ref(true);
let resendInterval: number | undefined;

const hasUserId = computed(() => !!props.userId);

async function handleVerify() {
    if (!props.email) {
        window.alert('No email address provided.');
        return;
    }
    if (!code.value.trim()) {
        window.alert('Please enter the verification code');
        return;
    }

    isLoading.value = true;

    const user = await authApi.verifyEmail({
        email: props.email,
        code: code.value.trim()
    });

    isLoading.value = false;

    if (user) {
        loginStore.clearPendingVerification();
    }

    alert('Email verified! Your email has been successfully verified. Please log in again to continue.');
    emit('login');
}

function handleResend() {
    if (!props.email) {
        window.alert('No email address provided.');
        return;
    }
    if (!canResend.value) {
        window.alert(`You can resend the code in ${resendCounter.value} seconds.`);
        return;
    }
    isResending.value = true;
    // resend function
    // Start cooldown
    canResend.value = false;
    resendCounter.value = 60;
    resendInterval = window.setInterval(() => {
        resendCounter.value -= 1;
        if (resendCounter.value <= 0) {
            canResend.value = true;
            clearInterval(resendInterval);
            resendInterval = undefined;
        }
    }, 1000);
    // Parent should handle isResending state and reset as needed
    setTimeout(() => {
        isResending.value = false;
    }, 1200);
}

function handleBack() {
    if (hasUserId.value) {
        emit('signup');
    } else {
        emit('login');
    }
}

onUnmounted(() => {
    if (resendInterval) clearInterval(resendInterval);
});
</script>

<style scoped>
.verify-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 24px 12px;
    background: #f5f5f5;
}
.verify-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 8px;
    color: #3b82f6;
    text-align: center;
}
.verify-subtitle {
    font-size: 1rem;
    color: #666;
    margin-bottom: 32px;
    text-align: center;
    line-height: 1.5;
}
.verify-email {
    font-weight: bold;
    color: #3b82f6;
    word-break: break-all;
}
.verify-form {
    width: 100%;
    max-width: 340px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.verify-input {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 1.1rem;
    outline: none;
    text-align: center;
    letter-spacing: 2px;
    transition: border-color 0.2s;
}
.verify-input:focus {
    border-color: #3b82f6;
}
.verify-button {
    background: #3b82f6;
    color: #fff;
    font-size: 1rem;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    padding: 14px 0;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}
.verify-button.disabled,
.verify-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
}
.resend-button {
    background: transparent;
    border: 1px solid #3b82f6;
    color: #3b82f6;
    font-size: 1rem;
    font-weight: bold;
    border-radius: 8px;
    padding: 14px 0;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}
.resend-button:disabled {
    color: #9ca3af;
    border-color: #9ca3af;
    cursor: not-allowed;
}
.back-button {
    background: none;
    border: none;
    color: #666;
    font-size: 0.95rem;
    cursor: pointer;
    padding: 10px 0 0 0;
    text-align: center;
}
.back-button:disabled {
    color: #bbb;
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
.loader-blue {
    border: 2px solid #3b82f6;
    border-top: 2px solid #fff;
}
@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 480px) {
    .verify-form {
        max-width: 100%;
    }
    .verify-container {
        padding: 16px 4px;
    }
}
</style>
