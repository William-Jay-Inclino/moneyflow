<template>
    <div class="modal fade" id="account_modal" tabindex="-1" aria-labelledby="account_modal_label" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-md">
            <form @submit.prevent="handleSave" class="modal-content shadow-lg rounded-4 border-0">
                <div class="modal-header border-0 pb-0">
                    <h1 class="modal-title fs-4 fw-semibold" id="account_modal_label">
                        {{ isEditMode ? 'Edit Account' : 'Add Account' }}
                    </h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body pt-1">
                    <div class="form-floating mb-3">
                        <input
                            type="text"
                            class="form-control"
                            id="account_name"
                            placeholder="Account Name"
                            v-model="formData.name"
                            required
                        />
                        <label for="account_name">Account Name</label>
                    </div>

                    <div class="form-floating mb-3">
                        <!-- <input
                            type="number"
                            class="form-control"
                            id="account_balance"
                            placeholder="Balance"
                            v-model="formData.balance"
                            step="0.01"
                            required
                        />< -->
                        <CurrencyInput 
                            inputClass="form-control"
                            id="account_balance"
                            placeholder="Balance"
                            v-model="formData.balance"
                            required
                        />
                        <label for="account_balance">Balance</label>
                    </div>

                    <div class="form-floating">
                        <textarea
                            class="form-control"
                            id="account_notes"
                            placeholder="Notes"
                            style="height: 100px"
                            v-model="formData.notes"
                        ></textarea>
                        <label for="account_notes">Notes</label>
                    </div>
                </div>

                <div class="modal-footer border-0 pt-0 d-flex justify-content-between">
                    <button
                        ref="closeBtn"
                        @click="clearForm()"
                        type="button"
                        class="btn btn-outline-secondary rounded-pill px-4"
                        data-bs-dismiss="modal"
                    >
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary rounded-pill px-4">
                        Save
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>



<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import CurrencyInput from './CurrencyInput.vue';

const props = defineProps<{
    isEditMode?: boolean,
    defaultData?: {
        name: string;
        balance: number;
        notes?: string;
    };
}>();

const emit = defineEmits(['save']);

const formData = reactive({
    name: '',
    balance: 0,
    notes: '' 
});

const closeBtn = ref<HTMLButtonElement | null>(null);


watch(
    () => props.defaultData,
    (newVal) => {
        if (newVal && props.defaultData) {
            formData.name = props.defaultData.name;
            formData.balance = props.defaultData.balance;
            formData.notes = props.defaultData.notes || '';
        }
    },
    { immediate: true, deep: true }
);

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