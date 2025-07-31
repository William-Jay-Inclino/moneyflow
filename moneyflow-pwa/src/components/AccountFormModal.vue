<template>
    <div class="modal fade" id="account_modal" tabindex="-1" aria-labelledby="account_modal_label" aria-hidden="true">
        <div class="modal-dialog">
            <form @submit.prevent="handleSave" class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="account_modal_label">{{ isEditMode ? 'Edit' : 'Add' }} Account</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="account_name" class="form-label">Account Name</label>
                        <input type="text" class="form-control" id="account_name" v-model="formData.name" required>
                    </div>
                    <div class="mb-3">
                        <label for="account_balance" class="form-label">Balance</label>
                        <input type="number" class="form-control" id="account_balance" v-model="formData.balance" required>
                    </div>
                    <div class="mb-3">
                        <label for="account_notes" class="form-label">Notes</label>
                        <textarea class="form-control" id="account_notes" v-model="formData.notes"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button ref="closeBtn" @click="clearForm()" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        </div>
    </div>
</template>


<script setup lang="ts">
import { reactive, ref } from 'vue';

defineProps<{
    isEditMode?: boolean
}>();

const emit = defineEmits(['save']);

const formData = reactive({
    name: '',
    balance: 0,
    notes: '' 
});

const closeBtn = ref<HTMLButtonElement | null>(null);

function handleSave() {
    emit('save', { ...formData }, closeBtn.value);
    clearForm();
}

function clearForm() {
    formData.name = '';
    formData.balance = 0;
    formData.notes = '';
}

</script>