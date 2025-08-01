<template>
    <div class="container d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light">
        <div class="forgot-password-card card shadow rounded-4 p-4 w-100" style="max-width: 420px;">
            <h2 class="mb-3 text-center text-primary fw-semibold">Reset Your Password</h2>
            <p class="text-center text-muted mb-4">
                Enter the email linked to your account and we’ll send you a temporary password.
                <br />
                <small class="text-secondary">Didn’t get the email? Check your spam folder.</small>
            </p>
            <form @submit.prevent="handleSubmit">
                <div class="mb-3">
                    <input
                        type="email"
                        class="form-control rounded-pill px-3 py-2"
                        placeholder="Email address"
                        required
                        autocomplete="email"
                        autofocus
                    />
                </div>
                <button
                    type="submit"
                    class="btn btn-primary rounded-pill w-100 py-2 fw-medium mb-2"
                >
                    Send Reset Link
                </button>
                <button
                    type="button"
                    class="btn btn-outline-secondary rounded-pill w-100 py-2 fw-medium"
                    @click="handleCancel"
                >
                    Cancel
                </button>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { authApi } from '../api';
import { ref } from 'vue';
import { showToast } from '../utils/helpers';

const emit = defineEmits(['login']);

const isSubmitting = ref(false);
const email = ref('');  

const handleSubmit = async () => {
    try {
        isSubmitting.value = true;
        const res = await authApi.forgotPassword(email.value);
        isSubmitting.value = false;

        if(res.success) {
            showToast('Password reset link sent to your email.', 'success');
            emit('login'); 
        } else {
            showToast(res.message, 'error');
        }


    } catch (error) {
        console.error('Error sending password reset link:', error);
    } finally {
        email.value = '';
    }
};

const handleCancel = () => {
    emit('login'); 
};

</script>


<style scoped>
.forgot-password-card {
    background-color: #ffffff;
    transition: box-shadow 0.2s ease;
}

.forgot-password-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
</style>
