<template>
    <div class="container income-container">

        <div v-show="!isEditMode" class="mb-3">
            <DatePicker @update="handleUpdateDate" :model-value="{ year: incomeStore.selectedYear, month: incomeStore.selectedMonth }"/>
        </div>

        <IncomeForm 
            type="income" 
            @submit="handleSubmit" 
            @cancel="handleCancelEdit"
            :is-loading="isSaving" 
            :is-edit-mode="isEditMode"
        />

        <div v-if="!showDetails && !isEditMode" class="toggle-section text-center mb-3">
            <button class="btn btn-soft toggle-button" @click="showDetails = true">
                <span>View Details</span>
                <span class="ms-2 toggle-icon">▼</span>
            </button>
        </div>

        <IncomeDetails 
            v-if="showDetails && !isEditMode" 
            :items="income_items" 
            :isLoading="isLoadingItems"
            @delete="handleDeleteIncome" 
            @edit="handleEditClick"
            type="income"
        />

        <div v-if="showDetails && !isEditMode" class="toggle-section text-center mb-3">
            <button class="btn btn-soft toggle-button" @click="showDetails = false">
                <span>Hide Details</span>
                <span class="ms-2 toggle-icon">▲</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import IncomeForm from './IncomeForm.vue';
import type { AuthUser, Category} from '../types';
import IncomeDetails from './IncomeExpenseDetails.vue';
import DatePicker from './DatePicker.vue';
import { useIncomeStore } from '../stores/income.store';
import { incomeApi } from '../api';
import { convertToDateString, get_auth_user_in_local_storage, showToast } from '../utils/helpers';
import { useLayoutStore } from '../stores/layout.store';

const incomeStore = useIncomeStore();
const layoutStore = useLayoutStore();
const isLoadingItems = ref(false);
const isSaving = ref(false);
const showDetails = ref(false);
const authUser = ref<AuthUser | null>(null);
const selectedItemIdForEdit = ref<string | null>(null);

onMounted(async () => {
    isLoadingItems.value = true;

    const user = get_auth_user_in_local_storage()

    if(!user) {
        console.error('No user found in local storage');
        return;
    }
    authUser.value = user;

    const incomes = await incomeApi.getIncome(user.user_id, incomeStore.selectedYear, incomeStore.selectedMonth);
    incomeStore.setIncomes(incomes);

    isLoadingItems.value = false;

});

const isEditMode = computed(() => !!selectedItemIdForEdit.value);

const income_items = computed(() => {
    return incomeStore.incomes
        .map(income => ({
            id: income.id,
            amount: income.amount,
            notes: income.notes,
            date: income.income_date,
            icon: income.category?.icon,
            category: income.category!,
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

async function handleSubmit(payload: { notes: string; amount: string; category: Category; day: number }) {
    
    if(selectedItemIdForEdit.value) {
        await handleUpdateIncome({...payload, income_id: selectedItemIdForEdit.value });
        selectedItemIdForEdit.value = null;
    } else {
        await handleAddIncome(payload);
    }

}

async function handleUpdateIncome(payload: {
    income_id: string;
    notes: string; 
    amount: string; 
    category: Category; 
    day: number;
}) {
    const dateString = convertToDateString(incomeStore.selectedYear, incomeStore.selectedMonth, payload.day);

    if (!authUser.value) {
        console.error('No authenticated user found');
        return;
    }

    isSaving.value = true;
    const updated = await incomeApi.updateIncome(authUser.value.user_id, payload.income_id, {
        category_id: payload.category.id,
        amount: payload.amount,
        notes: payload.notes,
        income_date: dateString
    });
    isSaving.value = false;

    if(updated) {
        incomeStore.updateIncome({
            id: updated.id,
            amount: updated.amount,
            notes: updated.notes,
            income_date: updated.income_date,
            category: updated.category
        });
        showToast('Item updated successfully!', 'success');

        layoutStore.setHeader({
            title: 'Add Income',
            subtitle: 'Quick and easy income tracking',
            color: '#3b82f6'
        });

    } else {
        showToast('Failed to add item. Please try again.', 'error');
    }

}

async function handleAddIncome(payload: { notes: string; amount: string; category: Category; day: number }) {

    const dateString = convertToDateString(incomeStore.selectedYear, incomeStore.selectedMonth, payload.day);

    if (!authUser.value) {
        console.error('No authenticated user found');
        return;
    }

    isSaving.value = true;
    const created = await incomeApi.createIncome(authUser.value.user_id, {
        category_id: payload.category.id,
        amount: payload.amount,
        notes: payload.notes,
        income_date: dateString
    });
    isSaving.value = false;

    if(created) {
        incomeStore.addIncome({
            id: created.id,
            amount: created.amount,
            notes: created.notes,
            income_date: created.income_date,
            category: created.category,
        });
        showToast('Item added successfully!', 'success');
    } else {
        showToast('Failed to add item. Please try again.', 'error');
    }

}

async function handleDeleteIncome(payload: { id: string }) {
    console.log('payload', payload);
    if (!authUser.value) {
        console.error('No authenticated user found');
        return;
    }

    const id = payload.id;

    isLoadingItems.value = true;
    const deleted = await incomeApi.deleteIncome(authUser.value.user_id, id);
    isLoadingItems.value = false;

    if (deleted) {
        incomeStore.deleteIncome(id);
        showToast('Item deleted successfully!', 'success');
    } else {
        showToast('Failed to delete item. Please try again.', 'error');
    }
}

async function handleUpdateDate(payload: { year: number, month: number}) {
    incomeStore.selectedYear = payload.year;
    incomeStore.selectedMonth = payload.month;

    isLoadingItems.value = true;

    if (!authUser.value) {
        console.error('No authenticated user found');
        return;
    }

    const incomes = await incomeApi.getIncome(authUser.value.user_id, payload.year, payload.month);
    incomeStore.setIncomes(incomes);
    isLoadingItems.value = false;
}

function handleEditClick(payload: { id: string }) {
    const item = incomeStore.incomes.find(exp => exp.id === payload.id);
    if (item) {
        selectedItemIdForEdit.value = payload.id;
        incomeStore.formData = {
            amount: item.amount.toString(),
            notes: item.notes,
            category: item.category,
            day: new Date(item.income_date).getDate()
        };

        layoutStore.setHeader({
            title: 'Update Income',
            subtitle: 'Track your earnings effortlessly',
            color: '#10b981'
        });

    }
}

function handleCancelEdit() {
    selectedItemIdForEdit.value = null;
    incomeStore.resetFormData();

    layoutStore.setHeader({
        title: 'Add Income',
        subtitle: 'Track your earnings effortlessly',
        color: '#10b981'
    });
}

</script>
