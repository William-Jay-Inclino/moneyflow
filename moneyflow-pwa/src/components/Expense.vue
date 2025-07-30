<template>
    <div class="container expense-container">

        <div class="mb-3">
            <DatePicker />
        </div>

        <ExpenseForm type="expense" @add="handleAddExpense" :is-loading="isSavingExpense"/>

        <div v-if="!showExpenseDetails" class="toggle-section text-center mb-3">
            <button class="btn btn-soft toggle-button" @click="showExpenseDetails = true">
                <span>View Details</span>
                <span class="ms-2 toggle-icon">▼</span>
            </button>
        </div>

        <ExpenseDetails v-if="showExpenseDetails" :expenses="expenseStore.expenses" :isLoading="isLoadingExpenses" />

        <div v-if="showExpenseDetails" class="toggle-section text-center mb-3">
            <button class="btn btn-soft toggle-button" @click="showExpenseDetails = false">
                <span>Hide Details</span>
                <span class="ms-2 toggle-icon">▲</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ExpenseForm from './IncomeExpenseForm.vue';
import type { Category} from '../types';
import ExpenseDetails from './IncomeExpenseDetails.vue';
import DatePicker from './DatePicker.vue';
import { useExpenseStore } from '../stores/expense.store';

const expenseStore = useExpenseStore();
const isLoadingExpenses = ref(false);
const isSavingExpense = ref(false);
const showExpenseDetails = ref(false);



function handleAddExpense(payload: { notes: string; amount: string; category: Category; day: number }) {
    console.log('adding', payload);
}


</script>
