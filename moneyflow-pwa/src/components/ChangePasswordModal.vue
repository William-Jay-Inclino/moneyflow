<template>
    <div class="modal fade" id="change_password_modal" tabindex="-1" aria-labelledby="change_password_modal_label" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-md">
            <form @submit.prevent="handleSave" class="modal-content shadow-lg rounded-4 border-0">
                <div class="modal-header border-0 pb-0">
                    <h1 class="modal-title fs-4 fw-semibold" id="account_modal_label">
                        Change Password
                    </h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body pt-1">
                    <input
                        type="text"
                        name="username"
                        autocomplete="username"
                        value="current_username_or_email"
                        style="position: absolute; left: -9999px; opacity: 0;"
                        readonly
                    />
                    <div class="form-floating mb-3">
                        <input
                            type="password"
                            v-model="formData.currentPassword"
                            class="form-control"
                            id="current_password"
                            placeholder="Current Password"
                            autocomplete="current-password"
                            required
                        />
                        <label for="current_password">Current Password</label>
                    </div>
                    <div class="form-floating mb-3">
                        <input
                            type="password"
                            v-model="formData.newPassword"
                            class="form-control"
                            id="new_password"
                            placeholder="New Password"
                            autocomplete="new-password"
                            required
                        />
                        <label for="new_password">New Password</label>
                    </div>
                    <div class="form-floating mb-3">
                        <input
                            type="password"
                            v-model="formData.confirmPassword"
                            class="form-control"
                            id="confirm_password"
                            placeholder="Confirm Password"
                            autocomplete="new-password"
                            required
                        />
                        <label for="confirm_password">Confirm Password</label>
                    </div>
                </div>

                <div class="modal-footer border-0 pt-0 d-flex justify-content-between">
                    <button
                        ref="closeBtn"
                        type="button"
                        class="btn btn-outline-secondary rounded-pill px-4"
                        data-bs-dismiss="modal"
                    >
                        Cancel
                    </button>
                    <button :disabled="isSaving" type="submit" class="btn btn-primary rounded-pill px-4">
                        {{ isSaving ? 'Saving...' : 'Save' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>



<script setup lang="ts">
import { reactive, ref } from 'vue';
import { showToast } from '../utils/helpers';
import { authApi } from '../api';

const formData = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

const closeBtn = ref<HTMLElement | null>(null);
const isSaving = ref(false);

async function handleSave() {
    if (formData.newPassword !== formData.confirmPassword) {
        showToast('New password and confirm password do not match.' , 'error');
        return;
    }
    
    isSaving.value = true;
    const res = await authApi.changePassword(formData.currentPassword, formData.newPassword);
    isSaving.value = false;

    if(res.success) {
        showToast('Password changed successfully.', 'success');
        formData.currentPassword = '';
        formData.newPassword = '';
        formData.confirmPassword = '';
        closeBtn.value?.click();
    } else {
        showToast(res.message, 'error');
    }


}

</script>


<style scoped>
.modal-content {
    animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>